import mongoose from "mongoose";

// Document unique (singleton) contenant les textes éditables de la section
// "À propos". On utilise une clé fixe ("main") pour toujours retrouver /
// mettre à jour le même document plutôt que d'en créer plusieurs.
const aboutSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    name: { type: String, default: "Thomas André", trim: true },
    bio: {
      type: String,
      default:
        "Ébéniste et designer d'objets, je conçois des pièces sur mesure qui allient matière brute et geste précis.",
    },
    portrait: {
      type: String,
      default: "https://picsum.photos/seed/denlam-portrait/500/600",
    },
  },
  { timestamps: true },
);

aboutSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.key;
    return ret;
  },
});

export default mongoose.model("About", aboutSchema);
