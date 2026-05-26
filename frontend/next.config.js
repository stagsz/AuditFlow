/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@auditflow/shared'],
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
