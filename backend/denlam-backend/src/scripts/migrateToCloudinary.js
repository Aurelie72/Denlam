import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { connectDB } from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import Creation from "../models/Creation.js";
import EtudePlan from "../models/EtudePlan.js";

const uploadDir = path.resolve("uploads");

// Envoie un fichier local vers Cloudinary et renvoie son URL définitive.
// Les images déjà sur Cloudinary (URL commençant par http) ou externes
// (picsum...) sont laissées telles quelles.
async function migrateOne(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) {
    return { newPath: imagePath, localFileToDelete: null };
  }

  const filename = path.basename(imagePath);
  const localPath = path.join(uploadDir, filename);

  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠ fichier introuvable, ignoré : ${filename}`);
    return { newPath: imagePath, localFileToDelete: null };
  }

  const result = await cloudinary.uploader.upload(localPath, {
    folder: "denlam",
    resource_type: "image",
  });

  console.log(`  ${filename} -> ${result.secure_url}`);
  return { newPath: result.secure_url, localFileToDelete: localPath };
}

async function processDocument(doc, label) {
  const filesToDeleteIfSaved = [];
  const newImages = [];

  for (const img of doc.images) {
    const { newPath, localFileToDelete } = await migrateOne(img);
    newImages.push(newPath);
    if (localFileToDelete) filesToDeleteIfSaved.push(localFileToDelete);
  }

  doc.images = newImages;

  try {
    await doc.save({ validateBeforeSave: false });
  } catch (err) {
    console.error(
      `  ✗ échec de la sauvegarde pour ${label}, upload Cloudinary conservé mais non lié :`,
      err.message,
    );
    return;
  }

  for (const f of filesToDeleteIfSaved) {
    fs.unlink(f, () => {});
  }

  console.log(`✓ ${label}`);
}

async function run() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error(
      "CLOUDINARY_CLOUD_NAME manquant dans .env — configure d'abord Cloudinary.",
    );
    process.exit(1);
  }

  await connectDB();

  console.log("Créations...");
  const creations = await Creation.find();
  for (const creation of creations) {
    await processDocument(creation, creation.name || creation.id);
  }

  console.log("\nPlans (Étude)...");
  const plans = await EtudePlan.find();
  for (const plan of plans) {
    await processDocument(plan, `plan ${plan.id}`);
  }

  console.log("\nTerminé — toutes les images sont maintenant sur Cloudinary.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
