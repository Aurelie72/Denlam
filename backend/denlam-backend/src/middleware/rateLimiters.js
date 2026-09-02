import rateLimit from "express-rate-limit";

// Login : 10 tentatives max par IP toutes les 15 minutes.
// Empêche un attaquant de tester des mots de passe en boucle.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Trop de tentatives de connexion. Réessaie dans quelques minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Formulaire de contact : 5 messages max par IP toutes les 15 minutes.
// Empêche un script de spammer la boîte mail / la base de messages.
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Trop de messages envoyés. Réessaie un peu plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite générale sur toute l'API : filet de sécurité contre les abus
// massifs (bots, scraping agressif), large pour ne jamais gêner un usage
// normal du site.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
