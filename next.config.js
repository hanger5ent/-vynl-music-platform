/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    outputFileTracingRoot: undefined,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
