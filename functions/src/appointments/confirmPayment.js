import { onCall, HttpsError } from "firebase-functions/v2/https";
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "../firebaseAdmin.js";


export const confirmAppointmentPayment = onCall(async (request) => {
  const db = getDb();
  const { holdId } = request.data;

  if (!holdId) {
    throw new HttpsError(
      "invalid-argument",
      "holdId es requerido"
    );
  }

  const ref = db.collection("appointments").doc(holdId);

  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      throw new HttpsError("not-found", "La cita no existe");
    }

    const data = snap.data();

    // 🔐 Validaciones críticas
    if (data.status !== "held") {
      throw new HttpsError(
        "failed-precondition",
        "La cita no está reservada"
      );
    }

    if (!data.heldUntil || data.heldUntil.toMillis() < Date.now()) {
      throw new HttpsError(
        "deadline-exceeded",
        "La reserva expiró"
      );
    }

    // ✅ Confirmar cita
    tx.update(ref, {
      status: "confirmed",
      confirmedAt: Timestamp.now(),
      heldUntil: null,
    });

    return {
      success: true,
      appointmentId: holdId,
    };
  });
});
