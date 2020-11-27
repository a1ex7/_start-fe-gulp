/* Menu open */
const menuBtn = document.querySelector('.js-menu-toggle');
const menuMobile = document.querySelector('.menu--mobile');
const menuIcon = document.querySelector('.menu-icon');

menuBtn.addEventListener('click', () => {
  menuMobile.classList.toggle('open');
  menuIcon.classList.toggle('open');
});

/* Smooth scroll */
const $menuLinks = document.querySelectorAll('.menu__link');

for (const $menuLink of $menuLinks) {
  $menuLink.addEventListener('click', (e) => {
    e.preventDefault();
    menuMobile.classList.remove('open');
    menuIcon.classList.remove('open');
    const targetId = e.target.getAttribute('href');
    const $targetSection = document.querySelector(targetId);
    scrollTo($targetSection);
  });
}

const scrollTo = (element) => {
  if (element) {
    window.scroll({
      behavior: 'smooth',
      left: 0,
      top: element.offsetTop,
    });
  }
};
