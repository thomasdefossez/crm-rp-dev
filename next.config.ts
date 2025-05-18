const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {}
  },
  webpack: (config: import('webpack').Configuration) => {
    if (!config.resolve) config.resolve = {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
      "@lib": path.resolve(__dirname, "lib"),
      "@app": path.resolve(__dirname, "app"),
      "@components": path.resolve(__dirname, "components"),
      "@maily.to": path.resolve(__dirname, "maily.to"),
    };
    return config;
  },
};

module.exports = nextConfig;