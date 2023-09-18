const express = require("express");
const recipe = require("../models/Recipe");
const recipeRouter = express.Router();
const recipeController = require("./../controllers/recipeController");
recipeRouter
  .route("/")
  .get(recipeController.loggedIn, recipeController.homepage);

recipeRouter.route("/signup").post(recipeController.signup);
recipeRouter.route("/login").post(recipeController.login);
recipeRouter.route("/login").get(recipeController.loginPage);
recipeRouter.route("/signup").get(recipeController.signupPage);
recipeRouter
  .route("/logout")
  .get(recipeController.loggedIn, recipeController.logout);
recipeRouter
  .route("/usersRecipe")
  .get(recipeController.loggedIn, recipeController.exploreUsersRecipe);
recipeRouter
  .route("/recipe/:id")
  .get(recipeController.loggedIn, recipeController.exploreRecipe);
recipeRouter
  .route("/categories")
  .get(recipeController.loggedIn, recipeController.exploreCategories);
recipeRouter
  .route("/categories/:id")
  .get(recipeController.loggedIn, recipeController.exploreCategory);
recipeRouter
  .route("/search")
  .post(recipeController.loggedIn, recipeController.searchRecipe);
recipeRouter
  .route("/delete/:id")
  .all(recipeController.loggedIn, recipeController.deleteRecipe);
recipeRouter
  .route("/explore-latest")
  .get(recipeController.loggedIn, recipeController.exploreLatest);
recipeRouter
  .route("/explore-random")
  .get(recipeController.loggedIn, recipeController.exploreRandom);
recipeRouter
  .route("/account")
  .get(recipeController.loggedIn, recipeController.account);
recipeRouter.use(recipeController.protect);
recipeRouter
  .route("/submit-recipe")
  .get(recipeController.submitRecipe)
  .post(recipeController.submitRecipeOnPost);

module.exports = recipeRouter;
