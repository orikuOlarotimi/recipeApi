const mongoose = require("mongoose");
const Recipe = require("../models/Recipie");
const Rating = require("../models/Rating");

exports.rateRecipe = async (req, res) => { 
   try {
    
    const recipieId = req.params.id
    const { value, feedback } = req.body;
    const userId = req.user._id; 

    if (!recipieId || !value) {
          return res.status(400).json({ message: "Recipe ID and rating value are required" });
     }

    const recipe = await Recipe.findById(recipieId);
    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }
    
     const rating = await Rating.findOneAndUpdate(
      { user: userId, recipe: recipieId },
      { value, feedback },
      { new: true, upsert: true, runValidators: true }
    );
    await Rating.recalcRecipeStats(recipieId);
    
    res.status(200).json({
      message: "Rating submitted successfully",
      rating
    });
   } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
   }
    

}

exports.getRecipeRatings = async (req, res) => {
  try {
    const recipeId  = req.params.id;
 
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
      }
      

    const ratings = await Rating.find({ recipe: recipeId })
      .populate("user", "username profilePic") // show reviewer info
      .sort({ createdAt: -1 });

    res.status(200).json({ message:"ratings sucessfully retrieved", ratings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ❌ Delete rating (user can remove their rating)
exports.deleteRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const recipeId  = req.params.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }
    
    const deleted = await Rating.findOneAndDelete({ user: userId, recipe: recipeId });
    if (!deleted) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Recalculate stats after delete
    await Rating.recalcRecipeStats(recipeId);
    res.status(200).json({ message: "Rating removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

