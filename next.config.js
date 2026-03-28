/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  compress: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: '/api/produits/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
}
module.exports = nextConfig
