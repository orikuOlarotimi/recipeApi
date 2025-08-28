const mongoose = require('mongoose')
const Recipe = require("./Recipie");

const ratingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, trim: true, maxlength: 500 }
    
}, { timestamps: true })
ratingSchema.index({ user: 1, recipe: 1 }, { unique: true });

ratingSchema.statics.recalcRecipeStats = async function (recipeId) {
  const agg = await this.aggregate([
    { $match: { recipe: new mongoose.Types.ObjectId(recipeId) } },
    { $group: { _id: "$recipe", avg: { $avg: "$value" }, count: { $sum: 1 } } }
  ]);

  const { avg = 0, count = 0 } = agg[0] || {};
  await Recipe.findByIdAndUpdate(recipeId, {
    $set: { ratingAvg: Number(avg.toFixed(2)), ratingCount: count }
  });
};

module.exports = mongoose.model("Rating", ratingSchema)