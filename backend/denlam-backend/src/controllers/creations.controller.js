import Creation from "../models/Creation.js";

// GET /api/creations?category=lampe
export async function listCreations(req, res) {
  const { category } = req.query;
  const filter = category && category !== "tous" ? { category } : {};
  const creations = await Creation.find(filter).sort({ createdAt: -1 });
  res.json(creations);
}

// GET /api/creations/:id
export async function getCreation(req, res) {
  const creation = await Creation.findById(req.params.id);
  if (!creation) {
    return res.status(404).json({ message: "Création introuvable." });
  }
  res.json(creation);
}

function resolveImages(req) {
  if (req.files && req.files.length > 0) {
    return req.files.map((f) => `/uploads/${f.filename}`);
  }
  if (req.body.images) {
    // Envoyé en JSON : tableau d'URLs. Envoyé en FormData sans fichier :
    // peut arriver en string unique ou en plusieurs champs "images".
    return Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }
  return null;
}

// POST /api/creations  (protégé)
export async function createCreation(req, res) {
  const { name, category, description } = req.body;
  const images = resolveImages(req);

  if (!images || images.length === 0) {
    return res
      .status(400)
      .json({ message: "Au moins une image est obligatoire." });
  }

  const creation = await Creation.create({
    name,
    category,
    description,
    images,
  });
  res.status(201).json(creation);
}

// PUT /api/creations/:id  (protégé)
export async function updateCreation(req, res) {
  const { name, category, description } = req.body;
  const update = { name, category, description };

  const images = resolveImages(req);
  if (images && images.length > 0) {
    update.images = images; // remplace entièrement le jeu de photos
  }

  const creation = await Creation.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!creation) {
    return res.status(404).json({ message: "Création introuvable." });
  }
  res.json(creation);
}

// DELETE /api/creations/:id  (protégé)
export async function deleteCreation(req, res) {
  const creation = await Creation.findByIdAndDelete(req.params.id);
  if (!creation) {
    return res.status(404).json({ message: "Création introuvable." });
  }
  res.status(204).send();
}
