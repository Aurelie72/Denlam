export function notFound(req, res) {
  res.status(404).json({ message: `Route inconnue : ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Données invalides.",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Cette ressource existe déjà." });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Identifiant invalide." });
  }

  res.status(err.status || 500).json({
    message: err.message || "Erreur serveur.",
  });
}
