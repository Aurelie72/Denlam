import mongoose from "mongoose";

const etudeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    description: {
      type: String,
      default:
        "De l'étude à la réalisation, j'accompagne chaque projet d'agencement avec précision : relevés sur site, plans 2D et 3D, conseils personnalisés pour concevoir un espace qui vous ressemble.",
    },
  },
  { timestamps: true },
);

etudeSettingsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.key;
    return ret;
  },
});

export default mongoose.model("EtudeSettings", etudeSettingsSchema);
