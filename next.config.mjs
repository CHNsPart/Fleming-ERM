/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
    domains: ['bkstr.scene7.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bkstr.scene7.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'fleming-erm.vercel.app',
      }
    ],
  },
};

export default nextConfig;
