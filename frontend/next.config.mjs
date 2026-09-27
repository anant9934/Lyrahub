/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress ESLint errors during Vercel build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Suppress TypeScript errors during Vercel build (type-check in CI separately)
  typescript: {
    ignoreBuildErrors: true,
  },



  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval for HMR
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.neon.tech https://*.render.com https://*.vercel.app http://localhost:8000",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Redirect http → (handled by Vercel/Cloudflare, but catch-all safety)
  async redirects() {
    return [];
  },

  // Image optimization — allow external image sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "**.render.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },

  // Webpack config for in-browser client ML inference
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};

export default nextConfig;
