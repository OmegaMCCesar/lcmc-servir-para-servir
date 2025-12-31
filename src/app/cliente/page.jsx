"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ClientePage() {
  const router = useRouter();
  const params = useSearchParams();
  const holdId = params.get("holdId");

  const [loading, setLoading] = useState(true);
  const [appointmentReady, setAppointmentReady] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (!holdId) {
      router.replace("/agenda");
      return;
    }

    const ref = doc(db, "appointments", holdId);

    // 🔁 Escuchar cambios hasta que el webhook confirme
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        router.replace("/agenda");
        return;
      }

      const data = snap.data();

      if (data.status === "confirmed") {
        setAppointmentReady(true);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [holdId, router]);

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

  // 🌀 SPINNER MIENTRAS STRIPE CONFIRMA
  if (loading) {
    return (
      <section className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="animate-spin mx-auto h-10 w-10 rounded-full border-4 border-(--lcmc-gold) border-t-transparent" />
        <p className="text-(--lcmc-white)/70">
          Confirmando tu pago…
        </p>
        <p className="text-xs text-(--lcmc-white)/50">
          Esto puede tardar unos segundos
        </p>
      </section>
    );
  }

  if (!appointmentReady) return null;

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
