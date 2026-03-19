const button = document.querySelector(".btn-primary");

button.addEventListener("click", () => {
  alert("Welcome to CryptoZ!");
});

// const toggle = document.getElementById("menu-toggle");
// const menu = document.getElementById("mobile-menu");

// toggle.addEventListener("click", () => {
//   menu.classList.toggle("active");
// });

const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("mobile-menu");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");
  menu.classList.toggle("active");
});
