import Link from "next/link";

const Header = () => {
  return (
    <header className="border-b border-(--lcmc-gray) py-4 bg-(--lcmc-black)">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        
        <h1 className="text-xl font-semibold text-(--lcmc-gold) tracking-wide">
          LCMC
        </h1>

        <button className="
          border border-(--lcmc-gold)
          px-4 py-2
          text-sm
          text-(--lcmc-gold)
          hover:bg-(--lcmc-gold)
          hover:text-(--lcmc-black)
          transition-colors
        ">
        <Link href="/agenda">
          Agendar revisión
        </Link>
        </button>
        <button className="
          border border-(--lcmc-gold)
          px-4 py-2
          text-sm
          text-(--lcmc-gold)
          hover:bg-(--lcmc-gold)
          hover:text-(--lcmc-black)
          transition-colors
        ">
          Verificar mi garantía
        </button>

      </div>
    </header>
  );
};

export default Header;
