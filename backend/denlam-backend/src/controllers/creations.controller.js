import Creation from "../models/Creation.js";

function normalizeArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

// GET /api/creations — liste toutes les créations, sans filtre
export async function listCreations(req, res) {
  const creations = await Creation.find().sort({ createdAt: -1 });
  res.json(creations);
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
// Combine les photos déjà enregistrées qu'on garde ("existingImages", URLs
// envoyées par le front, une par une, celles que l'admin n'a pas supprimées
// via la croix) avec les nouveaux fichiers uploadés.
export async function updateCreation(req, res) {
  const { name, description } = req.body;

  const keptExisting = normalizeArray(req.body.existingImages);
  const uploadedImages = (req.files || []).map((f) => f.cloudinaryUrl);
  const images = [...keptExisting, ...uploadedImages];

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
