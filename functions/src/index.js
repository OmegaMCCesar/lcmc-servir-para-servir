import { setGlobalOptions } from "firebase-functions/v2";
import { confirmAppointmentPayment } from "./appointments/confirmPayment.js";
import { holdAppointmentSlot } from "./appointments/holdAppointmentSlot.js";

setGlobalOptions({ maxInstances: 10 });

export {
  confirmAppointmentPayment,
  holdAppointmentSlot,
};
