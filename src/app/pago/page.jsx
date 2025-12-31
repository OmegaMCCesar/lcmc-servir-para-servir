"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function PagoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [appointment, setAppointment] = useState(null);
  const [holdId, setHoldId] = useState(null);

  useEffect(() => {
    const validateHold = async () => {
      const raw = sessionStorage.getItem("heldAppointment");

      if (!raw) {
        router.replace("/agenda");
        return;
      }

      const { holdId, expiresAt, date, slot } = JSON.parse(raw);

      if (!expiresAt || Date.now() > expiresAt) {
        sessionStorage.removeItem("heldAppointment");
        router.replace("/agenda");
        return;
      }

      const ref = doc(db, "appointments", holdId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        sessionStorage.removeItem("heldAppointment");
        router.replace("/agenda");
        return;
      }

      const hold = snap.data();

      if (
        hold.status !== "held" ||
        !hold.heldUntil ||
        Date.now() > hold.heldUntil.toMillis() ||
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
    if (!holdId || paying) return;

    setPaying(true);

    try {
      const res = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "No se pudo iniciar el pago");
      }

      // 🔁 Redirigir a Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      alert(error.message || "Error al iniciar el pago");
      setPaying(false);
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
        <p className="text-sm text-(--lcmc-white)/60">Servicio</p>
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
          <span className="line-through text-(--lcmc-white)/50">$750</span>{" "}
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
        disabled={paying}
        className="
          w-full
          bg-(--lcmc-gold)
          text-(--lcmc-black)
          py-3
          font-semibold
          transition
          disabled:opacity-50
          flex
          items-center
          justify-center
          gap-2
        "
      >
        {paying ? (
          <>
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-(--lcmc-black) border-t-transparent"></span>
            Redirigiendo a pago seguro…
          </>
        ) : (
          "Pagar $650 y confirmar cita"
        )}
      </button>

      <p className="text-xs text-(--lcmc-white)/50 text-center">
        Serás redirigido a Stripe para completar el pago de forma segura.
      </p>

    </section>
  );
}
