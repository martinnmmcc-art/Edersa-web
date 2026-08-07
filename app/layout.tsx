import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegistrarServiceWorker } from "@/components/UI/RegistrarServiceWorker";

export const metadata: Metadata = {
  title: "EDERSA · Red MT El Bolsón",
  description:
    "Mapa operativo de la red de media tensión (13.2kV / 33kV) de El Bolsón, con registro de eventos online y offline.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // evita el zoom accidental al tocar botones grandes en campo
  userScalable: false,
  themeColor: "#12181f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body>
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
