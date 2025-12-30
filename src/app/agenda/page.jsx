"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AgendaPage() {
  const router = useRouter();
  const [date, setDate] = useState("");

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);

  const formatDate = (d) => d.toISOString().split("T")[0];

  const handleContinue = () => {
    if (!date) return;
    router.push(`/agenda/${date}`);
  };

  return (
    <section className="max-w-md mx-auto space-y-6">
      
      <h2 className="text-3xl font-bold text-(--lcmc-white)">
        Agenda tu revisión
      </h2>

      <p className="text-(--lcmc-white)/70">
        Selecciona el día en que deseas recibir la visita técnica.
      </p>

      <div className="space-y-2">
        <label className="block text-sm text-(--lcmc-white)/60">
          Fecha disponible
        </label>

        <input
          type="date"
          min={formatDate(today)}
          max={formatDate(maxDate)}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="
            w-full
            px-4 py-3
            bg-transparent
            border
            border-(--lcmc-gray)
            text-(--lcmc-white)
            focus:outline-none
            focus:border-(--lcmc-gold)
          "
        />
      </div>

      <button
        onClick={handleContinue}
        disabled={!date}
        className="
          w-full
          bg-(--lcmc-gold)
          text-(--lcmc-black)
          py-3
          font-semibold
          disabled:opacity-40
          transition
        "
      >
        Ver horarios disponibles
      </button>

      <p className="text-xs text-(--lcmc-white)/50">
        Horarios sujetos a disponibilidad real.
      </p>

    </section>
  );
}
