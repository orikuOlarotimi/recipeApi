const Comment = require("../models/Comment");
const Recipe = require("../models/Recipie");


exports.createComment = async (req, res) => { 
    try {
        const recipeId  = req.params.id;
        const { text } = req.body;
      const userId = req.user._id;

        if (!text) {
           return  res.status(404).json({message:"text cannot be empty.", status:"failed"})
        }

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
        }

         const comment = await Comment.create({
            text,
            recipe: recipeId,
            user: userId,
            });

         res.status(201).json({ success: true, data: comment }); 
       
    } catch (error) {
        
    }

}

exports.getRecipeComments = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const comments = await Comment.find({ recipe: recipeId })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}