const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User Name is Required"],
  },
  email: {
    type: String,
    required: [true, "User Email is Required"],
    unique: [true, "Email is Used"],
  },
  image: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "User Password is Required"],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, "User Confirm Password is Required"],
  },
  recipes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Recipe",
    },
  ],
});

userSchema.pre("save", function (next) {
  console.log("pre middleware is running");
  this.confirmPassword = undefined;
  next();
});

const User = mongoose.model("user", userSchema);
module.exports = User;
