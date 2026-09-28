import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Car photos come from Google Drive (normalised to lh3.googleusercontent.com) or any HTTPS host the team pastes.
    // Tighten this list once you know where photos live.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**" },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },
  // Files read from disk at request time (sample-data fallback and guide articles) must ship with the serverless bundle.
  outputFileTracingIncludes: {
    "/**": ["./data/sample/**/*", "./content/guide/**/*"],
  },
  poweredByHeader: false,
};

export default nextConfig;
