/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  compress: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  /** Évite les erreurs « Cannot find module './NNNN.js' » en dev (cache webpack disque corrompu / chemins avec espaces). */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' }
    }
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Pas de cache CDN sur le catalogue : les badges (ERP) doivent se refléter tout de suite sur la vitrine.
      // Deux motifs : `:path*` ne couvre pas toujours l’URL exacte `/api/produits` selon les versions Next.
      {
        source: '/api/produits',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/api/produits/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
}
module.exports = nextConfig
