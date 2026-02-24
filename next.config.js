/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'export'，支持 Vercel 服务器端渲染和 API 路由
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
