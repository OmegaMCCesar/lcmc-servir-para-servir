import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "../firebaseAdmin.js";

export const holdAppointmentSlot = onCall(async (request) => {

    console.log("🚀 holdAppointmentSlot INVOCADA");
  console.log("📦 request.data:", request.data);

  const db = getDb();
  const { date, slot } = request.data;

    console.log("📅 date:", date);
  console.log("⏰ slot:", slot);

  if (!date || !slot) {
    throw new HttpsError("invalid-argument", "date y slot son requeridos");
  }

  const ref = db.collection("appointments").doc(`${date}_${slot}`);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);

      if (snap.exists) {
        const data = snap.data();

        if (
          data.status === "confirmed" ||
          (data.heldUntil && data.heldUntil.toMillis() > Date.now())
        ) {
          // ⛔ ERROR NORMAL, NO HttpsError
          throw new Error("SLOT_TAKEN");
        }
      }

      tx.set(ref, {
        date,
        slot,
        status: "held",
        heldUntil: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
        createdAt: Timestamp.now(),
      });

      return {
        success: true,
        holdId: ref.id,
        expiresIn: 600,
      };
    });

    return result;
  } catch (err) {
    if (err.message === "SLOT_TAKEN") {
      throw new HttpsError(
        "already-exists",
        "El horario ya está ocupadooo"
      );
    }

    console.error("holdAppointmentSlot error:", err);
    throw new HttpsError(
      "internal",
      "Error interno al reservar el horario"
    );
  }
});
