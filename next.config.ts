export default {
  cacheComponents: true,
  experimental: {
    inlineCss: true,
  },
  async redirects() {
    return [
      {
        source: "/advice",
        destination: "/projects",
        permanent: true,
      },
      {
        source: "/advice/:slug",
        destination: "/projects/:slug",
        permanent: true,
      },
      {
        source: "/pages/coffee-inf-recipes",
        destination: "/coffee-inf-recipes",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "www.datocms-assets.com",
        pathname: "/**",
      },
    ],
  },
};
