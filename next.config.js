/** @type {import('next').NextConfig} */
const nextConfig = {
  defaultRouteConfig: {
    amp: 'hybrid',
    api: {
      /* So that we can parse the body in the actions middleware */
      bodyParser: false
      /* If you want a parsed body in some api file like api/the-one-that-wants-a-parsed-body.js */
      /*
        export const config = {
          api: {
            bodyParser: true
          }
        }
      */
    }
  },
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
};
module.exports = nextConfig;
