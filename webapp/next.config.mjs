

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.loom.com" },
      { protocol: "https", hostname: "www.loom.com" },
    ],
  },
};

export default nextConfig;
