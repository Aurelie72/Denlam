import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import creationsRoutes from "./src/routes/creations.routes.js";
import settingsRoutes from "./src/routes/settings.routes.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      // Autorise aussi les requêtes sans origine (ex. curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origine non autorisée par CORS : ${origin}`));
    },
  }),
);
app.use(express.json());

// Sert les images uploadées (POST /api/creations avec un fichier)
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/creations", creationsRoutes);
app.use("/api/settings", settingsRoutes);

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
