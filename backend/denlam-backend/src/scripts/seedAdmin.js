import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";

async function run() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error("ADMIN_USERNAME et ADMIN_PASSWORD doivent être définis dans .env");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) {
    console.log(`L'utilisateur "${username}" existe déjà. Rien à faire.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await User.hashPassword(password);
  await User.create({ username: username.toLowerCase(), passwordHash });

  console.log(`Compte admin "${username}" créé avec succès.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
