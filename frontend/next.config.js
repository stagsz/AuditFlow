/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@iso9001/shared'],
  output: 'standalone',
    eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
