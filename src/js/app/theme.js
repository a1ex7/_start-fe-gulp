const themeBtn = document.getElementById('js-theme-btn');

themeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  document.body.classList.toggle('theme-is-black');
});
