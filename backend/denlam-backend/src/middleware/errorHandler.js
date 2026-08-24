export function notFound(req, res) {
  res
    .status(404)
    .json({ message: `Route inconnue : ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error(err); // détail complet dans les logs serveur uniquement

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Données invalides.",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000)
    return res.status(409).json({ message: "Cette ressource existe déjà." });
  if (err.name === "CastError")
    return res.status(400).json({ message: "Identifiant invalide." });

  const status = err.status || 500;

  // Pour les erreurs inattendues (500), on ne renvoie jamais le message
  // interne au client — il peut contenir des détails sensibles (chemins de
  // fichiers, infos de connexion à la base, etc.). Seules les erreurs
  // "attendues" avec un status explicite (< 500, ex. 400 levée volontairement
  // par un controller) gardent leur message, car il est destiné à l'utilisateur.
  const message =
    status < 500 && err.message
      ? err.message
      : "Erreur serveur. Réessaie plus tard.";

  res.status(status).json({ message });
}
