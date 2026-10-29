import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // uma pagina so, com as imagens ja em WebP nos tamanhos de uso
  images: { unoptimized: true },
};

export default nextConfig;
