export const runtime = "nodejs";

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db} from "../../../../lib/firebaseAdmin";


export async function POST(req) {
  try {
    const { holdId } = await req.json();

    if (!holdId) {
      return NextResponse.json(
        { error: "holdId requerido" },
        { status: 400 }
      );
    }

    // 🔥 Stripe SOLO en runtime
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // 🔎 Validar cita
    const ref = db.collection("appointments").doc(holdId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    const appointment = snap.data();

    if (
      appointment.status !== "held" ||
      !appointment.heldUntil ||
      appointment.heldUntil.toMillis() < Date.now()
    ) {
      return NextResponse.json(
        { error: "La reserva ya expiró" },
        { status: 409 }
      );
    }

    // 💳 Crear sesión de pago
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: "Revisión técnica a domicilio",
              description: `${appointment.date} · ${appointment.slot}`,
            },
            unit_amount: 65000,
          },
          quantity: 1,
        },
      ],
      metadata: {
        holdId,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cliente?holdId=${holdId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/agenda`,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Error al iniciar pago" },
      { status: 500 }
    );
  }
}
