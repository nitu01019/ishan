/** @type {import('next').NextConfig} */
const nextConfig = {

  // Compress responses
  compress: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kzvlzgbgmetulhrlsqoq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // CSP: wildcard *.spline.design for runtime + unpkg.com because @splinetool/runtime fetches @splinetool/modelling-wasm from unpkg at load time. wasm-unsafe-eval needed for Rapier physics.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.spline.design https://unpkg.com https://www.youtube-nocookie.com https://img.youtube.com",
              "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        // Cache static assets (immutable, hashed filenames)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache font files long-term
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
