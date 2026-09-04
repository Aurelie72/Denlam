import mongoose from "mongoose";

const etudePlanSchema = new mongoose.Schema(
  {
    description: { type: String, default: "", trim: true },
    images: {
      type: [String],
      required: [true, "Au moins une image est obligatoire"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Au moins une image est obligatoire",
      },
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

etudePlanSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("EtudePlan", etudePlanSchema);
