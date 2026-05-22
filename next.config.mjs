/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['192.168.88.38'],
  images: {
    unoptimized: true,
  },
}

export default nextConfig