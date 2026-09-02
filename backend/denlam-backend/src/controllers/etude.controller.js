import EtudeSettings from "../models/EtudeSettings.js";
import EtudePlan from "../models/EtudePlan.js";

function normalizeArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

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

// GET /api/etude/plans — public, du plus ancien au plus récent
export async function listPlans(req, res) {
  const plans = await EtudePlan.find().sort({ createdAt: 1 });
  res.json(plans);
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
// Combine les photos gardées ("existingImages") avec les nouveaux fichiers.
export async function updatePlan(req, res) {
  const keptExisting = normalizeArray(req.body.existingImages);
  const uploadedImages = (req.files || []).map((f) => f.cloudinaryUrl);
  const images = [...keptExisting, ...uploadedImages];

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
