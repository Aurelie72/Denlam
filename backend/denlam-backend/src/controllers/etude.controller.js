import EtudePlan from "../models/EtudePlan.js";
import { mergeImages } from "../utils/images.js";

// GET /api/etude/plans — public, triés par ordre personnalisé (le plus
// petit en premier), puis par date à défaut
export async function listPlans(req, res) {
  const plans = await EtudePlan.find().sort({ order: 1, createdAt: 1 });
  res.json(plans);
}

// PUT /api/etude/plans/reorder (protégé) — même principe que pour les
// créations : reçoit la liste des identifiants dans le nouvel ordre.
export async function reorderPlans(req, res) {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Liste d'identifiants invalide." });
  }

  await Promise.all(
    ids.map((id, index) => EtudePlan.findByIdAndUpdate(id, { order: index })),
  );
  res.json({ success: true });
}

// POST /api/etude/plans — protégé (multipart : "images" [plusieurs] + "description")
export async function createPlan(req, res) {
  const uploadedImages = (req.files || []).map((f) => f.cloudinaryUrl);
  if (uploadedImages.length === 0) {
    return res
      .status(400)
      .json({ message: "Au moins une image est obligatoire." });
  }
  const doc = await EtudePlan.create({
    description: req.body.description || "",
    images: uploadedImages,
  });
  res.status(201).json(doc);
}

// PUT /api/etude/plans/:id — protégé
// Combine les photos gardées avec les nouveaux fichiers (voir mergeImages
// dans utils/images.js).
export async function updatePlan(req, res) {
  const images = mergeImages(req);

  if (images.length === 0) {
    return res
      .status(400)
      .json({ message: "Au moins une image est obligatoire." });
  }

  const doc = await EtudePlan.findByIdAndUpdate(
    req.params.id,
    { description: req.body.description || "", images },
    { new: true, runValidators: true },
  );

  if (!doc) return res.status(404).json({ message: "Plan introuvable." });
  res.json(doc);
}

// DELETE /api/etude/plans/:id — protégé
export async function deletePlan(req, res) {
  const doc = await EtudePlan.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Plan introuvable." });
  res.status(204).send();
}
