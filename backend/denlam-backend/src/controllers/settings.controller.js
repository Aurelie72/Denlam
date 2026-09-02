import CreationsSettings from "../models/CreationsSettings.js";

// GET /api/settings/creations — public
export async function getCreationsSettings(req, res) {
  let doc = await CreationsSettings.findOne({ key: "main" });
  if (!doc) doc = await CreationsSettings.create({ key: "main" });
  res.json(doc);
}

// PUT /api/settings/creations — protégé
export async function updateCreationsSettings(req, res) {
  const { description } = req.body;
  const doc = await CreationsSettings.findOneAndUpdate(
    { key: "main" },
    { description },
    { new: true, upsert: true, runValidators: true },
  );
  res.json(doc);
}
