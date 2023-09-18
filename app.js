const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.use(cookieParser("CookingBlogSecure"));
app.use(
  session({
    secret: "CookingBlogSecretSession",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());
app.use(fileUpload());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/RecipeDB")
  .then(() => {
    console.log(`Database connection Successfully...`);
  })
  .catch((err) => {
    console.log(err);
  });

const routes = require("./server/routes/recipeRoutes.js");
const { json } = require("express/lib/response");
app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});
