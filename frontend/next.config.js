/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@auditflow/shared'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  env: {
    // Same-origin relative path: every Vercel deployment (production and
    // previews) serves its own backend under /_/backend/api, so a relative
    // base needs no CORS. Absolute URLs here break preview deployments and
    // cause cross-origin login failures after a domain migration.
    //
    // Guard: if NEXT_PUBLIC_API_URL points at a stale domain (e.g. the old
    // audit-flow.org), force the relative same-origin path in production so
    // the frontend never calls a different origin than the page it's served on.
    NEXT_PUBLIC_API_URL: (() => {
      const override = process.env.NEXT_PUBLIC_API_URL;
      const isProd = process.env.NODE_ENV === 'production';
      const looksStale =
        !!override &&
        /^https?:\/\//.test(override) &&
        !override.includes('localhost') &&
        !override.startsWith('/');
      if (isProd && looksStale) {
        return '/_/backend/api';
      }
      return override || (isProd ? '/_/backend/api' : 'http://localhost:3001/api');
    })(),
  },
}

module.exports = nextConfig
