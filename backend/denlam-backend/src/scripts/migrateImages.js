import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

// Les créations créées avant l'ajout du carrousel ont un champ "image"
// (string) au lieu de "images" (tableau). Ce script les convertit une
// bonne fois pour toutes. Sans danger à relancer plusieurs fois : les
// documents déjà migrés (qui ont "images") sont ignorés.
async function run() {
  await connectDB();
  const collection = mongoose.connection.collection("creations");

  const legacyDocs = await collection
    .find({ image: { $exists: true }, images: { $exists: false } })
    .toArray();

  if (legacyDocs.length === 0) {
    console.log("Rien à migrer — tout est déjà au format `images`.");
  } else {
    for (const doc of legacyDocs) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { images: [doc.image] }, $unset: { image: "" } },
      );
      console.log(`Migré : ${doc.name || doc._id}`);
    }
    console.log(`${legacyDocs.length} création(s) migrée(s).`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
