import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "CineScope",
  description: "Cartelera, venta de tiquetes y validación de ingreso para cine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#141414] text-white antialiased">{children}</body>
    </html>
  );
}
