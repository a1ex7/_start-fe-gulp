import $ from 'jquery';
import 'slick-carousel';

/* Slick slider */
$('.slider--testimonials').slick({

  arrows: true,
  dots: true,

  infinite: true,
  slidesToShow: 3,
  slidesToScroll: 1,

  autoplay: true,
  autoplaySpeed: 4000,

  // centerMode: true, // center big
  // variableWidth: true, // partial slider and variable width

  // asNavFor: '.banner', // navigate for another slider

  // appendArrows: '.slider__controls', // class for arrows
  // appendDots: '.s-testimonials__controls', // custom dots class (or customize it by theme)
  // prevArrow: '.s-gallery__controls .control--arrow-left', // custom arr class
  // nextArrow: '.s-gallery__controls .control--arrow-right', // custom arr class

  responsive: [
    {
      breakpoint: 480,
      settings: {
        dots: false
      }
    }
  ]
});