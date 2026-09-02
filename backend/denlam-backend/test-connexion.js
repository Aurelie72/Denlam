import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

console.log(
  "URI utilisée (masquée) :",
  process.env.MONGODB_URI.replace(/:[^:@]+@/, ":****@"),
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connexion réussie !");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Erreur complète :", err.message);
    console.error("Nom de l'erreur :", err.name);
    if (err.reason) {
      console.error("Détail (reason) :", JSON.stringify(err.reason, null, 2));
    }
    if (err.cause) {
      console.error("Cause sous-jacente :", err.cause);
    }
    process.exit(1);
  });
