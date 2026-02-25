/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
  // Opsional: Jika abang pakai form action terbaru, aktifkan ini
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Biar kalau upload foto basecamp yang gede nggak error "Payload Too Large"
    },
  },
};

export default nextConfig;