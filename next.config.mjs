/** @type {import('next').NextConfig} */

const BACKEND_API_PREFIXES = [
  "auth",
  "products",
  "categories",
  "cart",
  "orders",
  "user",
  "wishlist",
  "coupons",
  "banners",
  "blogs",
  "admin",
  "payments",
  "health",
];

function createBackendRewrites(apiBase) {
  return BACKEND_API_PREFIXES.flatMap((prefix) => [
    {
      source: `/api/${prefix}`,
      destination: `${apiBase}/api/${prefix}`,
    },
    {
      source: `/api/${prefix}/:path*`,
      destination: `${apiBase}/api/${prefix}/:path*`,
    },
  ]);
}

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com" },
    ],
  },

  async rewrites() {
    const apiBase =
      process.env.API_INTERNAL_URL || "http://localhost:888";

    return {
      afterFiles: createBackendRewrites(apiBase),
    };
  },

  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: true },
      { source: "/product", destination: "/products", permanent: true },
    ];
  },
};

export default nextConfig;
