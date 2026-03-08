import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      new URL('https://res.cloudinary.com/**'),
      new URL('https://picsum.photos/**'),
    ],
  },
};

export default nextConfig;
