var gulp           = require('gulp'),
    gutil          = require('gulp-util' ),
    sass           = require('gulp-sass'),
    browserSync    = require('browser-sync'),
    concat         = require('gulp-concat'),
    uglify         = require('gulp-uglify'),
    cleanCSS       = require('gulp-clean-css'),
    rename         = require('gulp-rename'),
    del            = require('del'),
    imagemin       = require('gulp-imagemin'),
    svgSprite      = require('gulp-svg-sprite'),
    cache          = require('gulp-cache'),
    autoprefixer   = require('gulp-autoprefixer'),
    notify         = require('gulp-notify'),
    sourcemaps     = require('gulp-sourcemaps'),
    pug            = require('gulp-pug'),
    fileinclude    = require('gulp-file-include'),
    combineMq      = require('gulp-combine-mq');

var smartgrid      = require('smart-grid');



/* Tasks */


/* Html with includes */

gulp.task('html', function() {
  return gulp.src(['src/html/**/*.html', '!src/html/**/_*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(gulp.dest('src'));
});



/* Pug Views Compile*/

gulp.task('pug', function() {
  return gulp.src(['src/pug/**/*.pug', '!src/pug/**/_*.pug'])
    .pipe(pug({
      pretty: true
    })).on('error', notify.onError())
    .pipe(gulp.dest('src'))
    .pipe(browserSync.reload({ stream: true }));
});



/* Compress common scripts */

gulp.task('common-js', function() {
  return gulp.src([
      'src/js/common.js',
      // other scripts
    ])
    .pipe(concat('common.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('src/js'));
});



/* Concatenate Libs scripts and common scripts */

gulp.task('js', ['common-js'], function() {
  return gulp.src([

      'src/libs/jquery/dist/jquery.min.js',
      'src/libs/slick-carousel/slick/slick.min.js',
      'src/libs/owl.carousel/dist/owl.carousel.min.js',
      // other lib scripts

      'src/js/common.min.js',
    ])
    .pipe(concat('scripts.min.js'))
    // .pipe(uglify())   // optional, if lib scripts not minimized
    .pipe(gulp.dest('src/js'))
    .pipe(browserSync.reload({ stream: true }));
});



/* Magic with sass files */

gulp.task('sass', function() {
  return gulp.src('src/sass/**/*.sass')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', notify.onError()))
    .pipe(autoprefixer(['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']))
    .pipe(gulp.dest('src/css'))
    // .pipe(combineMq()) // Grouping media queries
    .pipe(cleanCSS()) // Optional, remove unused style rules !danger
    .pipe(rename({ suffix: '.min', prefix: '' }))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.reload({ stream: true }));
});



/* Browser Sync Server */

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'src'
    },
    notify: true,
    // tunnel: true,
    // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
  });
});


/* Monitoring */

gulp.task('watch', ['pug', 'sass', 'js', 'browser-sync'], function() {
  //gulp.watch('src/html/**/*.html', ['html']);
  gulp.watch('src/pug/**/*.pug', ['pug']);
  gulp.watch('src/sass/**/*.sass', ['sass']);
  gulp.watch(['src/libs/**/*.js', 'src/js/**/*.js'], ['js']);
  gulp.watch('src/*.html', browserSync.reload);
});



/* Image optimization */

gulp.task('imagemin', function() {
  return gulp.src('src/img/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: false,
          removeUselessStrokeAndFill: true,
        }]
      }),
    ]))
    .pipe(gulp.dest('dist/img'));
});



/* Generate SVG Sprites */

gulp.task('sprites', function() {
  return gulp.src('src/img/svg/**/*.svg')
    .pipe(svgSprite({
      log: 'info',
      shape: {
        spacing: {
          padding: 0
        }
      },
      mode: {

        view: {
          dest: 'sass',
          dimensions: true,
          bust: false,
          layout: 'diagonal',
          sprite: '../img/sprites/sprite.svg',
          render: {
            scss: {
              dest: '_sprite.scss',
              template: 'src/img/sprites/tmpl/sprite.scss'
            }
          },
          example: {
            dest: '../img/sprites/sprite.html'
          }
        },

        symbol: {
          dest: 'sass',
          bust: false,
          sprite: '../img/sprites/sprite-symbol.svg',
          prefix: '.symbol-%s',
          inline: true,
          render: {
            scss: {
              dest: '_sprite-symbol.scss',
              // template: 'src/img/sprites/tmpl/sprite.scss'
            }
          },
          example: {
            dest: '../img/sprites/sprite-symbol.html'
          }
        }
      }
    }))
    .pipe(gulp.dest('src'));
});



/* Build project */

gulp.task('build', ['removedist', 'imagemin', 'html', 'sass', 'js'], function() {

  var buildHtml = gulp.src([
    'src/*.html',
  ]).pipe(gulp.dest('dist'));

  var buildCss = gulp.src([
    'src/css/main.min.css',
  ]).pipe(gulp.dest('dist/css'));

  var buildJs = gulp.src([
    'src/js/scripts.min.js',
  ]).pipe(gulp.dest('dist/js'));

  var buildFonts = gulp.src([
    'src/fonts/**/*',
  ]).pipe(gulp.dest('dist/fonts'));

});



/* Helpers */

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

/* Smart Grid Compile */
gulp.task('sg', function() {
  /* It's principal settings in smart grid project */
  var settings = {
    outputStyle: 'sass',
    /* less || scss || sass || styl */
    columns: 12,
    /* number of grid columns */
    offset: "30px",
    /* gutter width px || % */
    container: {
      maxWidth: '1200px',
      /* max-width оn very large screen */
      fields: '30px' /* side fields */
    },
    breakPoints: {
      lg: {
        'width': '1100px',
        /* -> @media (max-width: 1100px) */
        'fields': '30px' /* side fields */
      },
      md: {
        'width': '960px',
        'fields': '15px'
      },
      sm: {
        'width': '780px',
        'fields': '15px'
      },
      xs: {
        'width': '560px',
        'fields': '15px'
      }
      /*
      We can create any quantity of break points.

      some_name: {
          some_width: 'Npx',
          some_offset: 'N(px|%)'
      }
      */
    }
  };

  smartgrid('src/libs', settings);

})



/* Go! */

gulp.task('default', ['watch']);
