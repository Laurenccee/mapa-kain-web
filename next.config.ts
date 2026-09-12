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
  // MapTiler URLs carry a `?key=` query string, so they miss the default
  // cache's image/json regexes and would otherwise fall back to a 1hr
  // cross-origin NetworkFirst cache. Style/tiles rarely change, so cache
  // them aggressively to cut repeat-visit data usage on the map.
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.maptiler\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "maptiler-tiles",
          expiration: {
            maxEntries: 256,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
    ],
  },
})(nextConfig);

export default pwaWrappedConfig as NextConfig;
