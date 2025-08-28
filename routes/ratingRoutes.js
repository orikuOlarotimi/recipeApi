const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const authMiddleware = require("../middleware/authMiddleware"); // if you require auth

// ✅ Add or update rating for a recipe
router.post("/:id", authMiddleware, ratingController.rateRecipe);

// ✅ Get all ratings for a recipe
router.get("/:id", ratingController.getRecipeRatings);

// ✅ Delete user’s rating for a recipe
router.delete("/:id", authMiddleware, ratingController.deleteRating);

module.exports = router;
