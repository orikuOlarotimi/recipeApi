const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, favoriteController.addFavorite);
router.post("/remove", authMiddleware, favoriteController.removeFavorite);
router.get("/", authMiddleware, favoriteController.getFavorites);

module.exports = router;