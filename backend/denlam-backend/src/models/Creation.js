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
