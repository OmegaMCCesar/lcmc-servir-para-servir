import Stripe from "stripe";
import { headers } from "next/headers";
import { db, admin } from "../../../../lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export async function POST(req) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Firma inválida", err.message);
    return new Response("Webhook Error", { status: 400 });
  }

  // ✅ EVENTOS QUE NOS IMPORTAN
  switch (event.type) {
    case "checkout.session.completed": {
      const intent = event.data.object;

      const holdId = intent.metadata?.holdId;

      if (!holdId) {
        console.error("❌ No holdId en metadata");
        break;
      }

      const ref = db.collection("appointments").doc(holdId);
      const snap = await ref.get();

      if (!snap.exists) {
        console.error("❌ Appointment no existe", holdId);
        break;
      }

      // 🔒 Confirmación definitiva
      await ref.update({
        status: "confirmed",
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentIntentId: intent.id,
      });

      console.log("✅ Cita confirmada:", holdId);
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      console.warn("⚠️ Pago fallido:", intent.id);
      break;
    }

    default:
      console.log(`ℹ️ Evento ignorado: ${event.type}`);
  }

  return new Response("OK", { status: 200 });
}
