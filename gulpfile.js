var gulp           = require('gulp');

var browserSync    = require('browser-sync');
var del            = require('del');
var concat         = require('gulp-concat');
var fileinclude    = require('gulp-file-include');
var googleWebFonts = require('gulp-google-webfonts');
var imagemin       = require('gulp-imagemin');
var mozjpeg        = require('imagemin-mozjpeg');
var pngquant       = require('imagemin-pngquant');
var notify         = require('gulp-notify');
var pug            = require('gulp-pug');
var rename         = require('gulp-rename');
var sass           = require('gulp-sass');
var sourcemaps     = require('gulp-sourcemaps');
var svgSprite      = require('gulp-svg-sprite');
var uglify         = require('gulp-uglify');

var postcss        = require('gulp-postcss');
var autoprefixer   = require('autoprefixer');
var csso           = require('postcss-csso');
var mqpacker       = require('css-mqpacker');


/* Configuration */

var cfg = require('./gulp/config.js');


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
    .pipe(gulp.dest(cfg.dest.js));
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
  var plugins = [
    mqpacker(),
    autoprefixer({browsers: cfg.browserslist}),
    csso(),
  ];
  return gulp
    .src(cfg.src.sass + '/**/*.{sass,scss}')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded', // nested, expanded, compact, compressed
    }))
    .on('error', notify.onError({
        title: '<%= error.plugin %> in <%= error.relativePath %>',
        message: '<%= error.messageOriginal %>\nLine: <%= error.line %>, <%= error.column %>',
        sound: true,
    }))
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: '.min', prefix: '' }))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(cfg.src.css))
    .pipe(browserSync.reload({ stream: true }));
});


/* Browser Sync Server */

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: cfg.src.root
    },
    notify: true,
    // tunnel: true,
    // tunnel: 'projectmane', //Demonstration page: http://projectmane.localtunnel.me
  });
});



/* Monitoring */

gulp.task('watch', ['pug', 'sass', 'js', 'browser-sync'], function() {
  //gulp.watch(cfg.src.templates + '/**/*.html', ['html']);
  gulp.watch( cfg.src.pug  + '/**/*.pug', ['pug']);
  gulp.watch( cfg.src.sass + '/**/*.{sass,scss}', ['sass']);
  gulp.watch([cfg.src.libs + '/**/*.js', cfg.src.js + '/**/*.js' ], ['js']);
  gulp.watch( cfg.src.root + '/*.html', browserSync.reload);
});



/* Image optimization */

gulp.task('imagemin', function() {
  return gulp.src(cfg.src.img + '/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      //mozjpeg({progressive: true}),
      imagemin.optipng({ optimizationLevel: 3 }),
      //pngquant({quality: '85-100'}),
      imagemin.svgo({
        plugins: [{
          removeViewBox: false,
          removeUselessStrokeAndFill: true,
        }]
      }),
    ]))
    .pipe(gulp.dest(cfg.dest.img));
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



/* Download Google Fonts */

var options = {
  fontsDir: '../fonts/',
  cssDir: '../sass/',
  cssFilename: 'webfonts.css'
};

gulp.task('fonts', function() {
  return gulp.src('src/fonts/fonts.list')
    .pipe(googleWebFonts(options))
    .pipe(gulp.dest('src/fonts'));
});


/* Build project */

gulp.task('build', ['removedist', 'imagemin', 'pug', 'sass', 'js'], function() {

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

gulp.task('removedist', function() { return del.sync(cfg.dest.root); });



/* Go! */

gulp.task('default', ['watch']);
