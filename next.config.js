/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
 images: {
  domains: [
    'wincoe-bucket.s3.ap-south-1.amazonaws.com',
    'wincoe-bucket-local.s3.ap-south-1.amazonaws.com', // ✅ Add this
    'img.youtube.com',
  ],
},

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  }
}

module.exports = nextConfig;
