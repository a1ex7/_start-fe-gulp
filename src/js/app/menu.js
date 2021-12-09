/* Menu open */
const menuBtn = document.querySelector(".js-menu-toggle");
const menuMobile = document.querySelector(".menu");
const menuIcon = document.querySelector(".menu-icon");

menuBtn.addEventListener("click", () => {
  menuMobile.classList.toggle("open");
  menuIcon.classList.toggle("open");
});

/* Smooth scroll */
const menuLinks = document.querySelectorAll(".menu__link");

menuLinks.forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    menuMobile.classList.remove("open");
    menuIcon.classList.remove("open");
    const targetId = e.target.getAttribute("href");
    const $targetSection = document.querySelector(targetId);
    scrollTo($targetSection);
  });
});

const scrollTo = (element) => {
  if (element) {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: element.offsetTop,
    });
  }
};

/* Dropdown */
document.querySelectorAll(".dropdown").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.currentTarget.parentNode
      .querySelector(".dropdown__menu")
      .classList.toggle("show");
  });
});

document.querySelectorAll(".dropdown__item").forEach((el) => {
  el.addEventListener(
    "click",
    (e) => {
      e.currentTarget.parentNode.classList.remove("show");
    },
    false
  );
});
