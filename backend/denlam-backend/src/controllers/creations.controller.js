import Creation from "../models/Creation.js";
import { normalizeArray, mergeImages } from "../utils/images.js";

// GET /api/creations — liste toutes les créations, triées par ordre
// personnalisé (le plus petit en premier), puis par date à défaut
export async function listCreations(req, res) {
  const creations = await Creation.find().sort({ order: 1, createdAt: -1 });
  res.json(creations);
}

// PUT /api/creations/reorder (protégé) — reçoit la liste des identifiants
// dans le nouvel ordre souhaité, et met à jour le champ "order" de chacun
// en conséquence (position dans le tableau = nouvel ordre).
export async function reorderCreations(req, res) {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Liste d'identifiants invalide." });
  }

  await Promise.all(
    ids.map((id, index) => Creation.findByIdAndUpdate(id, { order: index })),
  );
  res.json({ success: true });
}

// GET /api/creations/:id
export async function getCreation(req, res) {
  const creation = await Creation.findById(req.params.id);
  if (!creation)
    return res.status(404).json({ message: "Création introuvable." });
  res.json(creation);
}

// POST /api/creations (protégé)
// multipart : "images" (fichiers, plusieurs possibles) + name/description
export async function createCreation(req, res) {
  const { name, description } = req.body;

  const uploadedImages = (req.files || []).map((f) => f.cloudinaryUrl);
  const bodyImages = normalizeArray(req.body.images); // fallback si des URLs sont envoyées en JSON
  const images = uploadedImages.length > 0 ? uploadedImages : bodyImages;

  if (images.length === 0) {
    return res
      .status(400)
      .json({ message: "Au moins une image est obligatoire." });
  }

  const creation = await Creation.create({ name, description, images });
  res.status(201).json(creation);
}

// PUT /api/creations/:id (protégé)
// Combine les photos déjà enregistrées qu'on garde avec les nouveaux
// fichiers uploadés (voir mergeImages dans utils/images.js).
export async function updateCreation(req, res) {
  const { name, description } = req.body;
  const images = mergeImages(req);

  if (images.length === 0) {
    return res
      .status(400)
      .json({ message: "Au moins une image est obligatoire." });
  }

  const update = { name, description, images };

  const creation = await Creation.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!creation)
    return res.status(404).json({ message: "Création introuvable." });
  res.json(creation);
}

// DELETE /api/creations/:id (protégé)
export async function deleteCreation(req, res) {
  const creation = await Creation.findByIdAndDelete(req.params.id);
  if (!creation)
    return res.status(404).json({ message: "Création introuvable." });
  res.status(204).send();
}
