const Recipe = require("../models/Recipie");

// Create Recipe
exports.createRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, images, cuisine, dietaryPreferences, tags, prepTimeMins, cookTimeMins, servings, isPublic } = req.body;

    if (!title || !steps || steps.length === 0 || !ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: "Title, ingredients, and steps are required" });
    }

    const recipe = await Recipe.create({
      author: req.user._id,
      title,
      description,
      ingredients,
      steps,
      images,
      cuisine,
      dietaryPreferences,
      tags,
      prepTimeMins,
      cookTimeMins,
      servings,
      isPublic
    });

    res.status(201).json({ message: "Recipe created successfully", recipe });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Public Recipes
exports.getRecipes = async (req, res) => {
  try {
    const { search, cuisine, dietary, tag } = req.query;
    let filter = { isPublic: true };

    if (search) {
  filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { tags: { $regex: search, $options: "i" } },
    { cuisine: { $regex: search, $options: "i" } },
    { dietaryPreferences: { $regex: search, $options: "i" } },
    { ingredients: { $regex: search, $options: "i" } }
  ];
}

    if (cuisine) filter.cuisine = { $regex: cuisine, $options: "i" };
    if (dietary) filter.dietaryPreferences = { $regex: dietary, $options: "i" };
    if (tag) filter.tags = { $regex: tag, $options: "i" };

    const recipes = await Recipe.find(filter).populate("author", "username email");
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("author", "username email");

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    res.status(200).json({ message: "recipies retrieved sucessfully", status:"success", recipe });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Recipe 
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedFields = [
      "title",
      "description",
      "ingredients",
      "steps",
      "images",
      "cuisine",
      "dietaryPreferences",
      "tags",
      "prepTimeMins",
      "cookTimeMins",
      "servings",
      "isPublic"
      ];
    

       allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        recipe[field] = req.body[field];
      }
    });

    await recipe.save();

    res.json({ message: "Recipe updated successfully", recipe });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};