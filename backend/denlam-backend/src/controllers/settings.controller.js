import About from "../models/About.js";

// GET /api/settings/about — public
export async function getAbout(req, res) {
  let doc = await About.findOne({ key: "main" });
  if (!doc) {
    // Crée le document par défaut au premier appel s'il n'existe pas encore
    doc = await About.create({ key: "main" });
  }
  res.json(doc);
}

// PUT /api/settings/about — protégé
export async function updateAbout(req, res) {
  const { name, bio } = req.body;
  const update = { name, bio };

  if (req.file) {
    update.portrait = `/uploads/${req.file.filename}`;
  } else if (req.body.portrait) {
    update.portrait = req.body.portrait;
  }

  const doc = await About.findOneAndUpdate({ key: "main" }, update, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  res.json(doc);
}
