import $ from 'jquery';
// import './slider';
// import './masonry';
// import './inputmask';

$(function() {
  
  /* Menu open */
  $('.js-menu-toggle').on('click', function() {
    $('.menu--mobile, .menu-icon').toggleClass('open');
  })

  /* Smooth scroll */
  $( '.menu__link, .category__link' ).on('click', function() {
    /* close meu */
    $('.menu--mobile, .menu-icon').removeClass('open');
    /* go to section */
    var targetId = $(this).attr('href');
    var $targetSection = $(targetId);
    if ($targetSection.length) {
      var targetPosition = $targetSection.offset().top;
      var headerHeight = $('.main-header').height();
      $('html, body').animate({
        scrollTop: targetPosition - headerHeight
      }, 400);
    }
  });

});