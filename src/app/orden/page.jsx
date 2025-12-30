"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function OrdenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      const raw = sessionStorage.getItem("lastPaidAppointment");
   console.log(raw, "orden ");
   
      if (!raw) {
        router.replace("/agenda");
        return;
      }

      const { holdId } = JSON.parse(raw);
       console.log(holdId , "orden hold");
       
      const ref = doc(db, "appointments", holdId);
      const snap = await getDoc(ref);

      if (!snap.exists() || snap.data().status !== "confirmed") {
        router.replace("/agenda");
        return;
      }

      setAppointment({
        id: holdId,
        ...snap.data(),
      });
      sessionStorage.removeItem("lastPaidAppointment");
      setLoading(false);
    };

    loadOrder();
  }, [router]);

  if (loading) {
    return (
      <section className="max-w-md mx-auto py-20 text-center">
        <p className="text-(--lcmc-white)/70">
          Generando orden de servicio...
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto space-y-6">

      <h2 className="text-3xl font-bold text-(--lcmc-white)">
        Orden de servicio creada
      </h2>

      <div className="border border-(--lcmc-gray) p-4 space-y-2">
        <p className="text-sm text-(--lcmc-white)/60">
          Número de orden
        </p>

        <p className="text-(--lcmc-gold) font-semibold">
          {appointment.id}
        </p>

        <p className="text-sm text-(--lcmc-white)/60 mt-4">
          Fecha y horario
        </p>

        <p className="text-(--lcmc-white)">
          {appointment.date} · {appointment.slot}
        </p>

        <p className="text-sm text-(--lcmc-white)/60 mt-4">
          Estado
        </p>

        <p className="text-(--lcmc-white)">
          Confirmada y pagada
        </p>
      </div>

      <button
        onClick={() => router.push("/")}
        className="
          w-full
          bg-(--lcmc-gold)
          text-(--lcmc-black)
          py-3
          font-semibold
        "
      >
        Volver al inicio
      </button>

    </section>
  );
}
