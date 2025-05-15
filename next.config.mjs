/** @type {import('next').NextConfig} */
const nextConfig = {
  // Active le mode strict de React pour détecter les problèmes potentiels
  reactStrictMode: true,

  // Correction de la section rewrites
 

  // Configuration du port via la variable d'environnement (gérée en dehors de next.config.js)
  experimental: {
    serverComponentsExternalPackages: ["prisma"], // Si tu utilises Prisma
  },

  // Configuration Webpack personnalisée pour handlebars-loader
  webpack: (config, { isServer }) => {
    // Ajouter handlebars-loader pour les fichiers .hbs
    config.module.rules.push({
      test: /\.hbs$/,
      use: "handlebars-loader",
    });

    // Retourner la configuration modifiée
    return config;
  },
};

// Utilisez export default au lieu de module.exports dans les fichiers .mjs
export default nextConfig;
