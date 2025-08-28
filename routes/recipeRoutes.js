const express = require('express')
const router = express.Router()
const recipie = require('../controllers/recipieController')
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", recipie.getRecipes)
router.get("/:id",  recipie.getRecipeById)
router.put("/:id", authMiddleware, recipie.updateRecipe)
router.post("/", authMiddleware, recipie.createRecipe)
router.delete("/:id", authMiddleware, recipie.deleteRecipe)

module.exports = router;
