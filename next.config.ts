import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // next-pwa injects a webpack config; this silences the Turbopack/webpack
  // conflict check in Next.js 16 (Turbopack is the default dev/build tool).
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "manonbziinxecvaprtgq.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

const pwaWrappedConfig = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
  },
})(nextConfig);

export default pwaWrappedConfig as NextConfig;
