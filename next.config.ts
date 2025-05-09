import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);

    // 👇 Add this block to handle CSS with Tailwind + Autoprefixer directly
    config.module.rules.push({
      test: /\.css$/,
      use: [
        require.resolve("style-loader"),
        require.resolve("css-loader"),
        {
          loader: require.resolve("postcss-loader"),
          options: {
            postcssOptions: {
              plugins: [
                require("tailwindcss"),
                require("autoprefixer"),
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;