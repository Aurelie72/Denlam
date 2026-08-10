import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI manquant dans .env");
  }

  mongoose.connection.on("connected", () => {
    console.log("[mongo] connecté");
  });
  mongoose.connection.on("error", (err) => {
    console.error("[mongo] erreur de connexion :", err.message);
  });

  await mongoose.connect(uri);
}
