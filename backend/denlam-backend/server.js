import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import path from "node:path";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import creationsRoutes from "./src/routes/creations.routes.js";
import messagesRoutes from "./src/routes/messages.routes.js";
import etudeRoutes from "./src/routes/etude.routes.js";
import backupRoutes from "./src/routes/backup.routes.js";
import { apiLimiter } from "./src/middleware/rateLimiters.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();

// Render (et la plupart des hébergeurs modernes) fait passer les requêtes
// par un proxy intermédiaire, qui ajoute un en-tête X-Forwarded-For avec la
// vraie IP du visiteur. Sans cette ligne, Express ne fait pas confiance à
// cet en-tête, et express-rate-limit ne peut plus identifier correctement
// qui envoie quoi (indispensable pour le limiteur anti-spam/anti-bruteforce).
// "1" = ne fait confiance qu'au premier proxy (celui de Render), pas à toute
// la chaîne — évite qu'un en-tête falsifié plus loin ne soit pris en compte.
app.set("trust proxy", 1);

// En-têtes de sécurité HTTP standard (protection clickjacking, MIME
// sniffing, etc.). crossOriginResourcePolicy désactivé pour que les images
// de /uploads restent chargeables depuis le domaine du frontend.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      callback(new Error(`Origine non autorisée par CORS : ${origin}`));
    },
  }),
);
app.use(express.json());

// Retire toute clé commençant par "$" ou contenant "." dans req.body/params/
// query — empêche l'injection d'opérateurs MongoDB (ex. { "$ne": null })
// glissés dans une requête.
app.use(mongoSanitize());

// Filet de sécurité général contre les abus (bots, scraping agressif) sur
// toute l'API. Les limites plus strictes (login, contact) s'ajoutent
// par-dessus sur leurs routes spécifiques.
app.use("/api", apiLimiter);

// Cache long : les noms de fichiers sont des UUID générés une seule fois
// et jamais réutilisés (voir processImages.js) — donc "immutable" est sûr,
// pas de risque de servir une ancienne version en cache après une modif.
app.use(
  "/uploads",
  express.static(path.resolve("uploads"), {
    maxAge: "30d",
    immutable: true,
  }),
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/creations", creationsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/etude", etudeRoutes);
app.use("/api/backup", backupRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`[server] en écoute sur http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("[server] impossible de démarrer :", err.message);
    process.exit(1);
  });
