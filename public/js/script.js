const addIngredientsBtn = document.querySelector("#addIngredients");
const ingredientList = document.querySelector(".ingredientList");
const ingredientDiv = document.querySelectorAll(".ingredientDiv")[0];
const deleteBtn = document.querySelector(".deleteBtn");
const logoutBtn = document.querySelector(".logoutBtn");

addIngredientsBtn.addEventListener("click", (e) => {
  e.preventDefault();

  let newIngredients = ingredientDiv.cloneNode(true);
  let input = newIngredients.getElementsByTagName("input")[0];
  input.value = "";
  ingredientList.appendChild(newIngredients);
});

logoutBtn.addEventListener("click", async (e) => {
  console.log("logout btn is clicked");
  e.preventDefault();
  const result = await axios({
    method: "GET",
    url: "http://localhost:5000/logout",
  });

  if (result.data.status === "success") {
    location.assign("/");
  }
});
