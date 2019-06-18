import Masonry from 'masonry-layout';
 
 /* Masonry */
new Masonry('.portfolio__items', {

    itemSelector: '.portfolio__item',
    columnWidth: '.portfolio__item',
    percentPosition: true,
    gutter: 0,
    horizontalOrder: true

});