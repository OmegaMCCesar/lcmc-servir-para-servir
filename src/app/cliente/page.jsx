"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [holdId, setHoldId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    const validatePaidAppointment = async () => {
      const raw = sessionStorage.getItem("lastPaidAppointment");
console.log(raw, "cliente");

      if (!raw) {
        router.replace("/agenda");
        return;
      }

      const { holdId } = JSON.parse(raw);
      const ref = doc(db, "appointments", holdId);
      const snap = await getDoc(ref);

      if (!snap.exists() || snap.data().status !== "confirmed") {
        router.replace("/agenda");
        return;
      }

      setHoldId(holdId);
      setLoading(false);
    };

    validatePaidAppointment();
  }, [router]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Completa los campos obligatorios");
      return;
    }

    try {
      // 👤 Crear cliente
      const clientRef = await addDoc(collection(db, "clients"), {
        ...form,
        createdAt: serverTimestamp(),
      });

      // 🔗 Vincular con la cita
      await updateDoc(doc(db, "appointments", holdId), {
        clientId: clientRef.id,
        updatedAt: serverTimestamp(),
      });


      router.push("/orden");
    } catch (error) {
      alert("No se pudo registrar el cliente");
    }
  };

  if (loading) {
    return (
      <section className="max-w-md mx-auto py-20 text-center">
        <p className="text-(--lcmc-white)/70">
          Preparando registro...
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto space-y-6">

      <h2 className="text-3xl font-bold text-(--lcmc-white)">
        Datos del cliente
      </h2>

      <p className="text-(--lcmc-white)/70">
        Necesitamos esta información para completar tu orden de servicio.
      </p>

      <input
        name="name"
        placeholder="Nombre completo"
        onChange={handleChange}
        className="w-full px-4 py-3 bg-transparent border border-(--lcmc-gray) text-(--lcmc-white)"
      />

      <input
        name="phone"
        placeholder="Teléfono"
        onChange={handleChange}
        className="w-full px-4 py-3 bg-transparent border border-(--lcmc-gray) text-(--lcmc-white)"
      />

      <input
        name="email"
        placeholder="Correo electrónico (opcional)"
        onChange={handleChange}
        className="w-full px-4 py-3 bg-transparent border border-(--lcmc-gray) text-(--lcmc-white)"
      />

      <textarea
        name="address"
        placeholder="Dirección completa"
        onChange={handleChange}
        className="w-full px-4 py-3 bg-transparent border border-(--lcmc-gray) text-(--lcmc-white)"
      />

      <button
        onClick={handleSubmit}
        className="
          w-full
          bg-(--lcmc-gold)
          text-(--lcmc-black)
          py-3
          font-semibold
        "
      >
        Confirmar datos y continuar
      </button>

      <p className="text-xs text-(--lcmc-white)/50">
        Tus datos están protegidos y solo se usan para el servicio.
      </p>

    </section>
  );
}
