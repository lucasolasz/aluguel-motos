import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.33", "10.34.6.112", "192.168.1.221"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "bucketaluguelmotos.ltech.app.br" },
    ],
  },
};

export default nextConfig;
