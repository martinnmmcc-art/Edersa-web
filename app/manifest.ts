import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EDERSA · Red MT El Bolsón",
    short_name: "EDERSA Red MT",
    description:
      "Visualización y registro operativo de la red de media tensión de El Bolsón.",
    start_url: "/mapa",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#12181f",
    theme_color: "#12181f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
