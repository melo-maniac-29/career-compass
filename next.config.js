/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the output: 'export' setting to allow server-side rendering
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'example.com',
      'images.unsplash.com',
    ],
  },
  // Remove exportPathMap - no longer needed when not using static export
  // Disable trailing slashes for cleaner URLs
  trailingSlash: false,
};

module.exports = nextConfig;
