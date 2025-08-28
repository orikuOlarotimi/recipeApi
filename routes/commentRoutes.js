const express = require("express");
const { createComment, getRecipeComments, deleteComment } = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:id", authMiddleware, createComment);
router.get("/:id", getRecipeComments);
router.delete("/:id", authMiddleware, deleteComment);

module.exports = router;
