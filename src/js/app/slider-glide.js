import Glide from '@glidejs/glide';

const slideNumber = document.querySelector('.js-slide-number');
const backward = document.querySelector('.js-prev');
const forward = document.querySelector('.js-next');

const glide = new Glide('.glide', {
  type: 'carousel',
  startAt: 0,
  perView: 3,
  gap: 10,
  peek: {
    before: 0,
    after: 0,
  },
  breakpoints: {
    992: {
      perView: 2,
    },
    768: {
      perView: 2,
    },
    576: {
      perView: 1,
    },
  },
}).mount();

/* Update slide number when changing slide  */
glide.on(['mount.after', 'run'], (e) => {
  let currentSlide = glide.index;
  slideNumber.textContent = `${currentSlide}`;
});

forward.addEventListener('click', () => {
  glide.go('>');
});

backward.addEventListener('click', () => {
  glide.go('<');
});
