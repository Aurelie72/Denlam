import mongoose from "mongoose";

const creationsSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    description: {
      type: String,
      default:
        "Découvrez mes créations : lampes, mobilier et objets de décoration, conçus et fabriqués sur mesure.",
    },
  },
  { timestamps: true },
);

creationsSettingsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.key;
    return ret;
  },
});

export default mongoose.model("CreationsSettings", creationsSettingsSchema);
