/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimisé pour les conteneurs Docker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
      {
        protocol: 'http',
        hostname: '**'
      }
    ]
  },
  // Configuration pour les variables d'environnement publiques
  env: {
    API_URL: process.env.API_URL || 'http://localhost'
  }
};

module.exports = nextConfig; 