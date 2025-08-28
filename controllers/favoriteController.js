const User = require("../models/User");
const Recipe = require("../models/Recipie");

// Add a recipe to favorites
exports.addFavorite = async (req, res) => {
  try {
    const user = req.user; 
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID required" });
      }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    // Prevent duplicates
    if (user.favorites.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe already in favorites" });
    }

    user.favorites.push(recipeId);
    await user.save();

    return res.status(200).json({ message: "Recipe added to favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove a recipe from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const user = req.user;
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID required" });
    }
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // ✅ Check if recipe is in favorites
    if (!user.favorites.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe not in favorites" });
    }

    user.favorites.pull(recipeId);
    await user.save();

    return res.status(200).json({ message: "Recipe removed from favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all favorites
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    console.log(user)
    return res.status(200).json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
