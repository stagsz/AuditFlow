/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@auditflow/shared'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  env: {
    // Same-origin relative path: every Vercel deployment (production and
    // previews) serves its own backend under /_/backend/api, so a relative
    // base needs no CORS. Absolute URLs here break preview deployments.
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production' ? '/_/backend/api' : 'http://localhost:3001/api'),
  },
}

module.exports = nextConfig
