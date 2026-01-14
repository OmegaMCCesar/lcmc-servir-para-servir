import Footer from "../components/layout/Footer";
import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata = {
  title: "LCMC – Soluciones técnicas en línea blanca, refrigeración y climatización",
  description: "Diagnóstico, mantenimiento y reparación profesional con garantía",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#0B0B0B] text-[#F5F5F5]">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
