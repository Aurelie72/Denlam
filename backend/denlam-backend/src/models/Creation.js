import mongoose from "mongoose";

const creationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["lampe", "mobilier", "decoration"],
        message: "Catégorie invalide : {VALUE}",
      },
    },
    // Plusieurs photos possibles : la première sert de photo principale
    // (vignette galerie + image affichée en premier dans le carrousel).
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
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

creationSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // "image" reste exposé (= la première photo) pour compat avec du code
    // qui n'a besoin que de la vignette (liste galerie).
    ret.image = ret.images?.[0] || null;
    return ret;
  },
});

export default mongoose.model("Creation", creationSchema);
