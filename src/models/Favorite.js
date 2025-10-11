// models/Favorite.js
import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);
