/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Clerk + Stripe domains for images/assets
  images: {
    domains: ["img.clerk.com"],
  },
};

module.exports = nextConfig;
