import mongoose from "mongoose";

const creationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
    },
    images: {
      type: [String],
      required: [true, "Au moins une image est obligatoire"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Au moins une image est obligatoire",
      },
    },
    description: {
      type: String,
      required: [true, "La description est obligatoire"],
      trim: true,
    },
    // Contrôle l'ordre d'affichage sur le site public (le plus petit en
    // premier). Par défaut à 0 pour les créations déjà existantes — elles
    // gardent alors leur tri habituel (les plus récentes en premier) tant
    // que personne n'a réordonné manuellement.
    order: { type: Number, default: 0 },
    // Point de recadrage de la photo principale (en %, 0-100), pour que le
    // recadrage carré de la galerie centre toujours sur la bonne zone —
    // 50/50 = centre, comportement par défaut si jamais réglé autrement.
    focalPoint: {
      x: { type: Number, default: 50, min: 0, max: 100 },
      y: { type: Number, default: 50, min: 0, max: 100 },
    },
  },
  { timestamps: true },
);

creationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    ret.image = ret.images?.[0] || null;
    return ret;
  },
});

export default mongoose.model("Creation", creationSchema);
