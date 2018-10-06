$(function() {

  /* Owl Carousel (optional) */
  // $('.owl-carousel').owlCarousel();

  /* Slick slider */
  $('.slider').slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    appendArrows: '.slider__controls', // class for arrows
  });

});
