import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CosmoDex — Gamified Coding Platform",
    short_name: "CosmoDex",
    description:
      "Gamified coding platform for students. Practice Python, SQL, complete challenges, and compete in real-time 1v1 Space Battles.",
    start_url: "/",
    display: "standalone",
    background_color: "#050508",
    theme_color: "#050508",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo.webp",
        sizes: "96x96",
        type: "image/webp",
      },
    ],
  };
}
