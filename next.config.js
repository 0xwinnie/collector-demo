/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    turbo: {
      loaders: {
        // Suppress console warnings in development
        '.js': ['babel-loader'],
      },
    },
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Suppress React key warnings in development
      config.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });
    }
    return config;
  },
};

module.exports = nextConfig;
