/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
allowedDevOrigins: ['10.2.0.2'],
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@react-pdf/renderer"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8081/api/:path*",
      },
    ]
  },
}

export default nextConfig
