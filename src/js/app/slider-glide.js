import Glide from '@glidejs/glide';

const slideNumber = document.querySelector('#js-slide-number');
const backward = document.querySelector('.js-prev');
const forward = document.querySelector('.js-next');

const glide = new Glide('.reviews__slider', {
  type: 'carousel',
  startAt: 0,
  perView: 1,
  gap: 20,
  peek: {
    before: 0,
    after: 357,
  },
  breakpoints: {
    992: {
      perView: 1,
      type: 'carousel',
    },
    768: {
      perView: 1,
      type: 'carousel',
      peek: {
        before: 0,
        after: 200,
      },
    },
    576: {
      perView: 1,
      type: 'carousel',
      peek: {
        before: 0,
        after: 0,
      },
    },
  },
}).mount();

/* Update slide number when changing slide  */
glide.on(['mount.after', 'run'], (e) => {
  let currentSlide = glide.index + 1;
  slideNumber.textContent = `${currentSlide}/`;
});

forward.addEventListener('click', () => {
  glide.go('>');
});

backward.addEventListener('click', () => {
  glide.go('<');
});
