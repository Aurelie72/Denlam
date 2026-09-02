import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Change le mot de passe du compte admin défini dans .env (ADMIN_USERNAME).
// Contrairement à seedAdmin.js (qui ne fait rien si le compte existe déjà),
// celui-ci met à jour le mot de passe même si le compte est déjà créé.
async function run() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error(
      "ADMIN_USERNAME et ADMIN_PASSWORD doivent être définis dans .env",
    );
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    console.error(
      `Aucun compte "${username}" trouvé. Utilise "npm run seed:admin" pour en créer un.`,
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  user.passwordHash = await User.hashPassword(password);
  await user.save();

  console.log(`Mot de passe mis à jour pour "${username}".`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
