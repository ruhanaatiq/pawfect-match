// src/models/Pet.js
import mongoose, { Schema } from "mongoose";

const PetSchema = new Schema(
  {
    name: String,
    species: String,
    breed: String,
    age: String,      // e.g. Puppy | Adult | Senior
    gender: String,   // Male | Female
    size: String,     // Small | Medium | Large
    image: String,
    tags: [String],
    shelter: String,
    distanceKm: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Pet || mongoose.model("Pet", PetSchema);
