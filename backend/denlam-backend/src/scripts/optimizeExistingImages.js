import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { connectDB } from "../config/db.js";
import Creation from "../models/Creation.js";
import EtudePlan from "../models/EtudePlan.js";

const uploadDir = path.resolve("uploads");
const MAX_WIDTH = 2000;
const QUALITY = 82;

async function compressLocalImage(imagePath) {
  if (!imagePath || !imagePath.startsWith("/uploads/")) {
    return { newPath: imagePath, oldFileToDelete: null };
  }
  if (imagePath.endsWith(".webp")) {
    return { newPath: imagePath, oldFileToDelete: null };
  }

  const filename = path.basename(imagePath);
  const inputPath = path.join(uploadDir, filename);

  if (!fs.existsSync(inputPath)) {
    console.warn(`  ⚠ fichier introuvable, ignoré : ${filename}`);
    return { newPath: imagePath, oldFileToDelete: null };
  }

  const newFilename = `${crypto.randomUUID()}.webp`;
  const outputPath = path.join(uploadDir, newFilename);

  const before = fs.statSync(inputPath).size;

  await sharp(inputPath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outputPath);

  const after = fs.statSync(outputPath).size;
  console.log(
    `  ${filename} -> ${newFilename} : ${(before / 1024).toFixed(0)} Ko -> ${(after / 1024).toFixed(0)} Ko`,
  );

  return { newPath: `/uploads/${newFilename}`, oldFileToDelete: inputPath };
}

async function processDocument(doc, label) {
  const filesToDeleteIfSaved = [];
  const newImages = [];

  for (const img of doc.images) {
    const { newPath, oldFileToDelete } = await compressLocalImage(img);
    newImages.push(newPath);
    if (oldFileToDelete) filesToDeleteIfSaved.push(oldFileToDelete);
  }

  doc.images = newImages;

  try {
    await doc.save({ validateBeforeSave: false });
  } catch (err) {
    console.error(
      `  ✗ échec de la sauvegarde pour ${label}, fichiers compressés conservés mais non liés :`,
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

  console.log("\nTerminé.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
