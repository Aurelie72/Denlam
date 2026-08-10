import EtudeSettings from "../models/EtudeSettings.js";
import EtudePhoto from "../models/EtudePhoto.js";

const VALID_TYPES = ["conseils", "releves", "plan2d", "plan3d"];

// GET /api/etude/settings — public
export async function getSettings(req, res) {
  let doc = await EtudeSettings.findOne({ key: "main" });
  if (!doc) doc = await EtudeSettings.create({ key: "main" });
  res.json(doc);
}

// PUT /api/etude/settings — protégé
export async function updateSettings(req, res) {
  const { description } = req.body;
  const doc = await EtudeSettings.findOneAndUpdate(
    { key: "main" },
    { description },
    { new: true, upsert: true, runValidators: true },
  );
  res.json(doc);
}

// GET /api/etude/photos?type=conseils — public
export async function listPhotos(req, res) {
  const { type } = req.query;
  if (type && !VALID_TYPES.includes(type)) {
    return res.status(400).json({ message: "Catégorie invalide." });
  }
  const filter = type ? { type } : {};
  const photos = await EtudePhoto.find(filter).sort({ createdAt: -1 });
  res.json(photos);
}

// POST /api/etude/photos — protégé (multipart : "images" + champ "type")
export async function addPhotos(req, res) {
  const { type } = req.body;
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ message: "Catégorie invalide." });
  }
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ message: "Au moins une image est obligatoire." });
  }

  const docs = await EtudePhoto.insertMany(
    req.files.map((f) => ({ type, image: `/uploads/${f.filename}` })),
  );
  res.status(201).json(docs);
}

// DELETE /api/etude/photos/:id — protégé
export async function deletePhoto(req, res) {
  const doc = await EtudePhoto.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Photo introuvable." });
  res.status(204).send();
}
