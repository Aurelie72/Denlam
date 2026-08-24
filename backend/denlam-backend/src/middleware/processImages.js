import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Largeur max raisonnable pour le web : au-delà, aucune photo affichée sur
// le site n'a besoin de plus de pixels, même en plein écran sur un grand
// moniteur. Réduit drastiquement le poids des photos prises au téléphone
// (souvent 3000-4000px de large).
const MAX_WIDTH = 2000;
const QUALITY = 82;

// À placer juste après upload.array(...)/upload.single(...) dans les
// routes. Transforme req.files (buffers en mémoire) en fichiers WebP
// optimisés écrits sur disque, et met à jour req.files pour que les
// controllers en aval (qui lisent file.filename) continuent de fonctionner
// sans rien changer.
export async function processImages(req, res, next) {
  try {
    if (req.files && req.files.length > 0) {
      req.files = await Promise.all(req.files.map(processOne));
    } else if (req.file) {
      req.file = await processOne(req.file);
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function processOne(file) {
  const filename = `${crypto.randomUUID()}.webp`;
  const outputPath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .rotate() // respecte l'orientation EXIF (essentiel pour les photos prises au téléphone)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outputPath);

  return { ...file, filename, path: outputPath };
}
