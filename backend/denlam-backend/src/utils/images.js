// Toujours renvoyer un tableau, que la valeur reçue soit absente, une seule
// chaîne (un seul <input existingImages> envoyé) ou déjà un tableau
// (plusieurs envoyés) — c'est le comportement par défaut de multer/Express
// avec les champs répétés d'un FormData.
export function normalizeArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

// Combine les photos déjà enregistrées qu'on garde ("existingImages", URLs
// envoyées par le front une par une — celles que l'admin n'a pas supprimées
// via la croix) avec les nouveaux fichiers tout juste uploadés et traités
// par processImages.js (accessibles via file.cloudinaryUrl). Utilisé à
// l'identique pour les créations et les plans étude.
export function mergeImages(req) {
  const kept = normalizeArray(req.body.existingImages);
  const uploaded = (req.files || []).map((f) => f.cloudinaryUrl);
  return [...kept, ...uploaded];
}
