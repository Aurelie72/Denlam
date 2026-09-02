import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

// Largeur max raisonnable pour le web : au-delà, aucune photo affichée sur
// le site n'a besoin de plus de pixels, même en plein écran sur un grand
// moniteur. Réduit drastiquement le poids des photos prises au téléphone
// (souvent 3000-4000px de large).
const MAX_WIDTH = 2000;
const QUALITY = 82;

// À placer juste après upload.array(...)/upload.single(...) dans les
// routes. Transforme req.files (buffers en mémoire) en images WebP
// optimisées, uploadées sur Cloudinary (stockage permanent, ne dépend pas
// du disque du serveur — voir la discussion sur les hébergeurs à disque
// éphémère). Met à jour req.files pour que les controllers en aval (qui
// lisent file.cloudinaryUrl) continuent de fonctionner.
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
  const buffer = await sharp(file.buffer)
    .rotate() // respecte l'orientation EXIF (essentiel pour les photos prises au téléphone)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  const cloudinaryUrl = await uploadBuffer(buffer);
  return { ...file, cloudinaryUrl };
}

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "denlam", // regroupe toutes les images du site dans un même dossier Cloudinary
        resource_type: "image",
        format: "webp",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
