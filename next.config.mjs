/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.io', 'gateway.ipfs.io'],
  },
  // Rimuovere serverActions da experimental poiché è ora disponibile di default
  experimental: {
    // serverActions: true, <- rimuovere questa riga
  },
  // La configurazione della porta non va in 'server' ma deve essere gestita tramite script
  // ,
};

export default nextConfig;
