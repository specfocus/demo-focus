/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* https://nextjs.org/docs/api-reference/next.config.js/rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*' // Proxy to Backend
      }
    ]
  }
  */
}
module.exports = nextConfig
