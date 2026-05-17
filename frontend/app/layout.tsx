import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rio Ride Rental - Aluguel de Motos por Temporada",
  description: "Alugel de motos por temporada com a Rio Ride Rental. Reserve sua moto para viagens, passeios ou necessidades temporárias. Oferecemos uma variedade de modelos, preços competitivos e um processo de reserva fácil. Aproveite a liberdade de explorar com nossas motos de aluguel por temporada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
