import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6">
      
      <h2 className="text-4xl font-bold text-(--lcmc-white) tracking-tight">
        LCMC – Soluciones técnicas en línea blanca, refrigeración y climatización
      </h2>

      <p className="text-lg text-(--lcmc-white)/80">
        Diagnóstico técnico a domicilio con procesos claros y garantía real.
      </p>

      <p className="max-w-xl text-(--lcmc-white)/60">
       Reparación y mantenimiento de electrodomésticos, refrigeradores, lavadoras, secadoras, aire acondicionado y equipos comerciales.
      </p>

      <button
        className="
          bg-(--lcmc-gold)
          text-(--lcmc-black)
          px-6 py-3
          font-semibold
          hover:opacity-90
          transition
        "
      >
        <Link href="/agenda"> 
        Agendar revisión
        </Link>
      </button>

      <p className="text-sm text-(--lcmc-white)/60">
        Revisión a domicilio:{" "}
        <span className="line-through opacity-70">$750</span>{" "}
        <strong className="text-(--lcmc-gold)">
          $650 pagando en línea
        </strong>
      </p>

    </section>
  );
}
