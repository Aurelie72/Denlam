import multer from "multer";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function fileFilter(_req, file, cb) {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(
      new Error(
        "Format d'image non supporté (jpg, png, webp, gif uniquement).",
      ),
    );
  }
  cb(null, true);
}

// Stockage en mémoire : les fichiers ne sont écrits sur disque qu'après
// être passés par processImages (redimensionnement + compression + WebP).
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 Mo en entrée (avant compression)
});
