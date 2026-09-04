import Creation from "../models/Creation.js";
import EtudePlan from "../models/EtudePlan.js";
import Message from "../models/Message.js";
import CreationsSettings from "../models/CreationsSettings.js";
import EtudeSettings from "../models/EtudeSettings.js";

// GET /api/backup (protégé) — génère et renvoie un export JSON complet de
// la base à la volée, en téléchargement direct. Pensé pour être déclenché
// par un simple bouton dans /admin, utilisable sans aucune connaissance
// technique (pas de terminal, pas de script à lancer).
export async function downloadBackup(req, res) {
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
    creations,
    plans,
    messages,
    creationsSettings,
    etudeSettings,
  };

  const filename = `denlam-backup-${new Date().toISOString().slice(0, 10)}.json`;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(JSON.stringify(backup, null, 2));
}
