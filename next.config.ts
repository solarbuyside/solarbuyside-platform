import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // O Manual é um asset grande e imutável: cache agressivo no navegador
        // (com Range já habilitado, evita re-baixar a cada abertura).
        source: "/:path*.pdf",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
