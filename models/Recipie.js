const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 2000 },

    ingredients: [{ type: String, required: true, trim: true }],
    steps: [{ type: String, required: true }],

    images: [{ type: String, trim: true }], // store file URLs or paths

    cuisine: { type: String, trim: true },  // e.g. "Italian"
    dietaryPreferences: [{ type: String, trim: true }], // e.g. ["Vegetarian", "Vegan"]
    tags: [{ type: String, trim: true }], // helpful for search

    prepTimeMins: { type: Number, min: 0 },
    cookTimeMins: { type: Number, min: 0 },
    servings: { type: Number, min: 1, default: 1 },

    isPublic: { type: Boolean, default: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

recipeSchema.index({ user: 1, title: 1 }, { unique: true });
module.exports = mongoose.model("Recipe", recipeSchema);

