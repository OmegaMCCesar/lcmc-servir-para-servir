"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { holdAppointmentSlot } from "../../../lib/appointments";

const TIME_SLOTS = [
  { id: "08-11", label: "08:00 – 11:00" },
  { id: "11-14", label: "11:00 – 14:00" },
  { id: "14-17", label: "14:00 – 17:00" },
  { id: "17-20", label: "17:00 – 20:00" },
];

export default function TimeSlotsPage() {
  const { fecha } = useParams();
  const router = useRouter();

  const [selected, setSelected] = useState(null);
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected || loading) return;

    setLoading(true);

    try {
      const hold = await holdAppointmentSlot({
        
        date: fecha,
        slot: selected,
      });
      console.log(hold);
      

      sessionStorage.setItem(
        "heldAppointment",
        JSON.stringify({
          date: fecha,
          slot: selected,
          holdId: hold.holdId,
          expiresAt: Date.now() + hold.expiresIn * 1000,
        })
      );

      router.push("/pago");
    } catch (error) {
      alert("Este horario ya fue tomado. Por favor elige otro.");
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      const q = query(
        collection(db, "appointments"),
        where("date", "==", fecha),
        where("status", "in", ["held", "paid"])
      );

      const snapshot = await getDocs(q);
      const blocked = snapshot.docs.map((doc) => doc.data().slot);

      setUnavailableSlots(blocked);
    };

    fetchAvailability();
  }, [fecha]);

  return (
    <section className="max-w-md mx-auto space-y-6">

      <h2 className="text-3xl font-bold text-(--lcmc-white)">
        Horarios disponibles
      </h2>

      <p className="text-(--lcmc-white)/70">
        Fecha seleccionada:{" "}
        <span className="text-(--lcmc-gold) font-semibold">
          {fecha}
        </span>
      </p>

      <div className="space-y-3">
        {TIME_SLOTS.map((slot) => {
          const isUnavailable = unavailableSlots.includes(slot.id);
          const isSelected = selected === slot.id;

          return (
            <button
              key={slot.id}
              disabled={isUnavailable}
              onClick={() => setSelected(slot.id)}
              className={`
                w-full
                px-4 py-4
                border
                text-left
                transition
                ${
                  isUnavailable
                    ? "border-(--lcmc-gray) opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "border-(--lcmc-gold) bg-(--lcmc-gold)/10"
                    : "border-(--lcmc-gray) hover:border-(--lcmc-gold)"
                }
              `}
            >
              <span className="text-(--lcmc-white) font-medium">
                {slot.label}
              </span>

              {isUnavailable && (
                <span className="block text-xs text-(--lcmc-white)/50">
                  No disponible
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected || loading}
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
        {loading ? "Reservando horario..." : "Continuar al pago"}
      </button>

      <p className="text-xs text-(--lcmc-white)/50">
        El horario se reservará temporalmente al continuar.
      </p>

    </section>
  );
}
