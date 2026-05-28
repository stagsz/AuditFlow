/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@auditflow/shared'],
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
