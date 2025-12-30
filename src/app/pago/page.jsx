"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { confirmAppointmentPayment } from "../../lib/appointments";

export default function PagoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [holdId, setHoldId] = useState(null);

  useEffect(() => {
    const validateHold = async () => {
      const raw = sessionStorage.getItem("heldAppointment");
      console.log(raw);
      

      if (!raw) {
        router.replace("/agenda");
        return;
      }

      const data = JSON.parse(raw);
      const { holdId, expiresAt, date, slot } = data;

      // ⏱ Validar expiración local
      if (!expiresAt || Date.now() > expiresAt) {
        sessionStorage.removeItem("heldAppointment");
        router.replace("/agenda");
        return;
      }

      // 🔥 Validar en Firestore
      const ref = doc(db, "appointments", holdId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        sessionStorage.removeItem("heldAppointment");
        router.replace("/agenda");
        return;
      }

      const hold = snap.data();

      if (!hold.heldUntil || Date.now() > hold.heldUntil.toMillis()) {
  sessionStorage.removeItem("heldAppointment");
  router.replace("/agenda");
  return;
}

      if (
        hold.status !== "held" ||
        hold.date !== date ||
        hold.slot !== slot
      ) {
        sessionStorage.removeItem("heldAppointment");
        router.replace("/agenda");
        return;
      }

      setAppointment({ date, slot });
      setHoldId(holdId);
      setLoading(false);
    };

    validateHold();
  }, [router]);

  const handlePay = async () => {
    if (!holdId) return;
 console.log(holdId, "pago log");
 
    try {
      // 💳 Aquí después irá Stripe / MercadoPago
      await confirmAppointmentPayment({ holdId });

      // ✅ GUARDAR ESTADO DE CITA PAGADA
      sessionStorage.setItem(
        "lastPaidAppointment",
        JSON.stringify({ holdId })
      );

      // 🧹 Limpieza controlada
      sessionStorage.removeItem("heldAppointment");

      router.push("/cliente");
    } catch (error) {
      alert(error.message || "No se pudo confirmar la cita");
      sessionStorage.removeItem("heldAppointment");
      router.replace("/agenda");
    }
  };

  if (loading) {
    return (
      <section className="max-w-md mx-auto py-20 text-center">
        <p className="text-(--lcmc-white)/70">
          Validando reserva...
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto space-y-6">

      <h2 className="text-3xl font-bold text-(--lcmc-white)">
        Pago de revisión
      </h2>

      <p className="text-(--lcmc-white)/70">
        Estás a punto de confirmar tu cita técnica.
      </p>

      {/* Resumen */}
      <div className="border border-(--lcmc-gray) p-4 space-y-2">
        <p className="text-sm text-(--lcmc-white)/60">
          Servicio
        </p>

        <p className="text-(--lcmc-white) font-medium">
          Revisión técnica a domicilio
        </p>

        <p className="text-sm text-(--lcmc-white)/60 mt-4">
          Fecha y horario
        </p>

        <p className="text-(--lcmc-white)">
          {appointment.date} · {appointment.slot}
        </p>

        <p className="text-sm text-(--lcmc-white)/60 mt-4">
          Precio
        </p>

        <p className="text-lg">
          <span className="line-through text-(--lcmc-white)/50">
            $750
          </span>{" "}
          <span className="text-(--lcmc-gold) font-semibold">
            $650 MXN
          </span>
        </p>

        <p className="text-xs text-(--lcmc-white)/50">
          Descuento exclusivo por pago en línea
        </p>
      </div>

      {/* Botón de pago */}
      <button
        onClick={handlePay}
        className="
          w-full
          bg-(--lcmc-gold)
          text-(--lcmc-black)
          py-3
          font-semibold
          transition
          hover:opacity-90
        "
      >
        Pagar $650 y confirmar cita
      </button>

      <p className="text-xs text-(--lcmc-white)/50">
        Al continuar aceptas nuestros términos de servicio.
      </p>

    </section>
  );
}
