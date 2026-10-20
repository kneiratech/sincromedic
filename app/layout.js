import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";

// Atkinson Hyperlegible: tipografía del Braille Institute diseñada para personas con baja visión
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata = {
  title: "SincroMedic — Cuidado familiar",
  description: "Coordina medicinas, citas y gastos del cuidado de tus padres.",
};

export const viewport = {
  themeColor: "#16306B",
  width: "device-width",
  initialScale: 1,
};

// Aplica el tamaño de letra guardado antes de pintar (evita parpadeo)
const textSizeScript = `try{var m=document.cookie.match(/(?:^|; )text-size=(lg|xl)/);if(m)document.documentElement.dataset.text=m[1]}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${atkinson.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: textSizeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
