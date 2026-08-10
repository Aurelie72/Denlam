import mongoose from "mongoose";

const etudePhotoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: {
        values: ["conseils", "releves", "plan2d", "plan3d"],
        message: "Catégorie invalide : {VALUE}",
      },
    },
    image: {
      type: String,
      required: [true, "Une image est obligatoire"],
    },
  },
  { timestamps: true },
);

etudePhotoSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("EtudePhoto", etudePhotoSchema);
