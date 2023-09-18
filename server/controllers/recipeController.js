const category = require("./../models/Category");
const recipe = require("../models/Recipe");
const user = require("./../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.homepage = async function (req, res, next) {
  try {
    const limitNumber = 5;
    const categoryObj = await category.find().limit(limitNumber);
    const latestrecipe = await recipe
      .find({})
      .sort({ _id: -1 })
      .limit(limitNumber);
    const food = { latestrecipe };

    res.render("index", {
      title: "Cooking Blog - Home",
      categories: categoryObj,
      food: food,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 20;
    const categoryObj = await category.find().limit(limitNumber);

    res.render("categories", {
      title: "Categories Page",
      categories: categoryObj,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.exploreRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const currentRecipe = await recipe.findById(recipeId);
    res.render("recipe", { title: "Recipe", currentRecipe });
  } catch (err) {
    console.log(err);
  }
};

exports.exploreCategory = async (req, res) => {
  try {
    const categoryid = req.params.id;
    console.log(`Category Id is: ${categoryid}`);
    const currentCategory = await recipe.find({ category: categoryid });
    res.render("categories", { title: "Category", currentCategory });
  } catch (err) {
    console.oog(err);
  }
};

exports.searchRecipe = async (req, res) => {
  try {
    const searchQuery = req.body.searchTerm;
    const foundRecipe = await recipe.find({
      $text: { $search: searchQuery, $diacriticSensitive: true },
    });
    res.render("search", { title: "Search Recipe", foundRecipe });
  } catch (err) {
    console.log(err);
  }
};

exports.exploreLatest = async (req, res) => {
  try {
    const latestRecipe = await recipe.find({}).sort({ _id: -1 });
    res.render("latest", { title: "Latest", latestRecipe });
  } catch (err) {
    console.log(err);
  }
};

exports.exploreRandom = async (req, res) => {
  try {
    const count = await recipe.find({}).countDocuments();
    let random = Math.floor(Math.random() * count);
    const randomRecipe = await recipe.findOne().skip(random).exec();

    res.render("random", { title: "Random", randomRecipe });
  } catch (err) {
    console.log(err);
  }
};

exports.submitRecipe = async (req, res) => {
  const infoErrors = req.flash("Info Errors");
  const infoSuccess = req.flash("InfoSuccess");
  res.render("submit", { title: "Submit Recipe", infoErrors, infoSuccess });
};

exports.submitRecipeOnPost = async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new Error("No Files were Uploaded");
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;
      uploadPath =
        require("path").resolve("./") + "/public/uploads/" + newImageName;
      imageUploadFile.mv(uploadPath, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
    // req.flash("Info Submit", "Recipe Has Been Added.");
    const newRecipe = new recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName,
    });

    await newRecipe.save();

    const CurrentUser = await user.findByIdAndUpdate(req.loggedInUser._id, {
      $push: {
        recipes: newRecipe._id,
      },
    });
    console.log("this is current user");
    console.log(CurrentUser);

    res.redirect("/submit-recipe");
  } catch (err) {
    console.log(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new Error("No Files were Uploaded");
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;
      uploadPath =
        require("path").resolve("./") + "/public/user-img/" + newImageName;
      imageUploadFile.mv(uploadPath, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }

    const name = req.body.name;
    const email = req.body.email;
    let password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    password = await bcrypt.hash(password, 12);
    const newUser = new user({
      name,
      email,
      image: newImageName,
      password,
      confirmPassword,
    });

    await newUser.save();

    const token = await jwt.sign({ id: newUser._id }, process.env.JWTSECRET);

    console.log("signup token: " + token);
    res.cookie("jwt", token);
    res.redirect("/");
    // res.json({
    //   status: "success",
    //   data: newUser,
    //   token,
    // });
  } catch (err) {
    console.log(err);
  }
};

exports.loginPage = async (req, res, next) => {
  res.render("login", { title: "Login Page" });
};

exports.signupPage = async (req, res, next) => {
  res.render("signup", { title: "SignUp Page" });
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      throw new Error("Please Enter Email or Password for Login");
    }
    const foundUser = await user.findOne({ email });
    if (!foundUser) {
      throw new Error("No User Found of this Email");
    }

    const isCorrectUser = await bcrypt.compare(password, foundUser.password);

    let token;
    if (isCorrectUser) {
      token = await jwt.sign({ id: foundUser._id }, process.env.JWTSECRET);
    } else {
      throw new Error("Incorrect Password");
    }

    console.log("Login Token: " + token);
    res.cookie("jwt", token);
    res.redirect("/");
    // res.json({
    //   status: "success",
    //   data: foundUser,
    //   token,
    // });
  } catch (err) {
    console.log(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new Error("User is not Logged In");
    }

    let decodeInfo;
    if (token) {
      jwt.verify(token, process.env.JWTSECRET, function (err, decode) {
        decodeInfo = decode;
      });
    }

    const CurrentUser = await user.findById(decodeInfo.id);
    if (!CurrentUser) {
      throw new Error("User does not exists");
    }

    req.loggedInUser = CurrentUser;

    next();
  } catch (err) {
    console.log(err);
  }
};

exports.loggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      let token = req.cookies.jwt;
      let decodeInfo;

      jwt.verify(token, process.env.JWTSECRET, function (err, decode) {
        decodeInfo = decode;
      });

      const CurrentUser = await user
        .findById(decodeInfo.id)
        .populate("recipes");
      if (!CurrentUser) {
        return next();
      }
      req.loggedInUser = CurrentUser;
      res.locals.user = CurrentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.account = async (req, res, next) => {
  // console.log(req.loggedInUser);
  const userRecipes = await user
    .findById(req.loggedInUser._id)
    .populate("recipes");
  console.log("populated Fields");
  console.log(userRecipes.recipes);
  res.render("account", {
    title: "Account Page",
    recipes: userRecipes.recipes,
  });
};

exports.deleteRecipe = async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    await recipe.deleteOne({ _id: recipeId });
    await user.findByIdAndUpdate(req.loggedInUser._id, {
      $pull: { recipes: req.params.id },
    });

    res.render("account", { title: "Account Page" });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = (req, res, next) => {
  res.cookie("jwt", "thisisinvalidtoken");
  res.redirect("/");
};

exports.exploreUsersRecipe = function (req, res, next) {
  res.render("usersRecipes", { title: "Users Recipes" });
};
// async function insertRecipeData() {
//   try {
//     await recipe.insertMany([
//       {
//         name: "Star-Studded Blueberry Pie",
//         description: `On a lightly floured surface, roll one half of pie dough to a 1/8-in.-thick circle; transfer to a 9-in. pie plate. Trim pastry even with rim; flute edge. Refrigerate 30 minutes. Leave remaining pie dough refrigerated.
//         Preheat oven to 400°. Combine blueberries, sugar, tapioca, lemon juice and salt; toss gently. Let stand for 15 minutes.
//         Add filling to pie pastry; dot with butter. Bake 20 minutes on a lower oven rack. Reduce heat to 350°; bake 10 minutes more. Cover edges loosely with foil to prevent burning. Return to lower rack of oven; bake 15-20 minutes longer, until blueberries are bubbly and beginning to burst. Cool on a wire rack.
//         Roll remaining dough to a 1/8-in.-thick circle. Cut out stars using different-sized cookie cutters as desired. Place on an ungreased baking sheet. Bake at 350° until golden brown, 5-10 minutes. Remove to wire racks to cool. Place stars over cooled pie in any pattern desired`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "Pastry for double-crust pie (9 inches)",
//           "4 cups fresh or frozen blueberries",
//           "1 cup sugar",
//           "1/4 cup quick-cooking tapioca",
//           "1 tablespoon lemon juice",
//           "1/4 teaspoon salt",
//           "2 tablespoons butter",
//         ],
//         category: "American",
//         image: "star-studded-blueberry-pie.jpg",
//       },
//       {
//         name: "Recipe Name Goes Here",
//         description: `Recipe Description Goes Here`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 level teaspoon baking powder",
//           "1 level teaspoon cayenne pepper",
//           "1 level teaspoon hot smoked paprika",
//         ],
//         category: "American",
//         image: "southern-friend-chicken.jfif",
//       },
//     ]);
//   } catch (err) {
//     console.log(err);
//   }
// }

// insertRecipeData();

// Function for initially inserting category data into the database

// async function insertCategoryData() {
//   try {
//     await category.insertMany([
//       { name: "Thai", image: "thai-food.jpg" },
//       { name: "American", image: "american-food.jpg" },
//       { name: "Chinese", image: "chinese-food.jpg" },
//       { name: "Mexican", image: "mexican-food.jpg" },
//       { name: "Indian", image: "indian-food.jpg" },
//       { name: "Spanish", image: "spanish-food.jpg" },
//     ]);
//   } catch (err) {
//     console.log(err);
//   }
// }

// insertCategoryData();
