import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { connectDB } from "../config/db.js";
import Creation from "../models/Creation.js";
import EtudePlan from "../models/EtudePlan.js";
import Message from "../models/Message.js";
import CreationsSettings from "../models/CreationsSettings.js";
import EtudeSettings from "../models/EtudeSettings.js";

// Exporte tout le contenu de la base (créations, plans étude, messages,
// textes d'intro) dans un seul fichier JSON horodaté, dans le dossier
// backups/ à la racine du projet. MongoDB Atlas gratuit n'inclut aucune
// sauvegarde automatique — ce script comble ce manque, à lancer
// manuellement de temps en temps (voir la note en bas du fichier généré).
async function run() {
  await connectDB();

  const [creations, plans, messages, creationsSettings, etudeSettings] =
    await Promise.all([
      Creation.find(),
      EtudePlan.find(),
      Message.find(),
      CreationsSettings.find(),
      EtudeSettings.find(),
    ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    counts: {
      creations: creations.length,
      plans: plans.length,
      messages: messages.length,
    },
    creations,
    plans,
    messages,
    creationsSettings,
    etudeSettings,
  };

  const backupsDir = path.resolve("backups");
  fs.mkdirSync(backupsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(backupsDir, `denlam-backup-${timestamp}.json`);

  fs.writeFileSync(filePath, JSON.stringify(backup, null, 2), "utf-8");

  console.log(`✓ Sauvegarde créée : ${filePath}`);
  console.log(
    `  ${creations.length} créations, ${plans.length} plans, ${messages.length} messages.`,
  );
  console.log(
    "\n⚠ Pense à copier ce fichier ailleurs que sur ce seul PC (Google Drive, clé USB...)",
  );
  console.log(
    "  — une sauvegarde qui ne vit qu'au même endroit que l'original ne protège de rien.",
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
