const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category Name is Required"],
  },
  image: {
    type: String,
    required: [true, "Category Image is Required"],
  },
});

const category = mongoose.model("Category", categorySchema);
module.exports = category;
