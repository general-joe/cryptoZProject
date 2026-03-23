// Grab the main call-to-action button in the navbar so we can attach behavior to it.
const button = document.querySelector(".btn-primary");

// When the user clicks the button, show a simple welcome message.
// This is just a lightweight demo interaction for now.
button.addEventListener("click", () => {
  alert("Welcome to CryptoZ!");
});

// Older mobile-menu toggle experiment kept for reference while building.
// It only opened the menu and did not animate the hamburger icon itself.
// const toggle = document.getElementById("menu-toggle");
// const menu = document.getElementById("mobile-menu");

// toggle.addEventListener("click", () => {
//   menu.classList.toggle("active");
// });

// Select the hamburger icon and the hidden mobile navigation panel.
const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("mobile-menu");

// Toggling the `active` class does two things:
// 1. Changes the hamburger lines into an "X"
// 2. Expands or collapses the mobile menu
toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");
  menu.classList.toggle("active");
});
