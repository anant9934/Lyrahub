import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AIMETRA — AI & ML Department Intelligence Layer",
    short_name: "AIMETRA",
    description:
      "AI & ML Education, Talent, Research & Analytics intelligence layer for the Department of Artificial Intelligence & Machine Learning.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#111111",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
