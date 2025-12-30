import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase"; // 👈 OJO con esta ruta

const functions = getFunctions(app, "us-central1");

/**
 * 🔒 Reserva temporalmente un horario
 */
export const holdAppointmentSlot = async ({ date, slot }) => {
    
  try {
    const fn = httpsCallable(functions, "holdAppointmentSlot");
    const result = await fn({ date, slot });
    console.log("🔥 HOLD RESULT:", result);
    console.log("🔥 HOLD DATA:", result.data);
    return result.data;
  } catch (error) {
    console.error(`h🔥 holdAppointmentSlot error:`, error);

    // Esto es CLAVE en onCall
    if (error.code) {
      throw new Error(error.message);
    }

    throw error;
  }
};


/**
 * 💳 Confirma la cita después del pago
 */
export const confirmAppointmentPayment = async ({ holdId }) => {
  const fn = httpsCallable(functions, "confirmAppointmentPayment");
  const result = await fn({ holdId });
  return result.data;
};
