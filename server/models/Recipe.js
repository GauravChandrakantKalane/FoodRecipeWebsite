const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Recipe Name is Required"],
  },
  description: {
    type: String,
    required: [true, "Recipe Description is Required"],
  },
  email: {
    type: String,
    required: [true, "Recipe email is Required"],
  },
  ingredients: {
    type: Array,
    required: [true, "Recipe ingredients is Required"],
  },
  category: {
    type: String,
    enum: ["Thai", "American", "Chinese", "Mexican", "Indian", "Spanish"],
    required: [true, "Recipe category is Required"],
  },
  image: {
    type: String,
    required: [true, "Recipe Image is Required"],
  },
});

recipeSchema.index({ name: "text", description: "text", category: "text" });
// recipeSchema.index({ "$**": "text" });

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
