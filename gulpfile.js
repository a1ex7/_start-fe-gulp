const gulp           = require('gulp');

const browserSync    = require('browser-sync');
const del            = require('del');
const concat         = require('gulp-concat');
const fileinclude    = require('gulp-file-include');
const googleWebFonts = require('gulp-google-webfonts');

const imagemin       = require('gulp-imagemin');
const mozjpeg        = require('imagemin-mozjpeg');
const pngquant       = require('imagemin-pngquant');

const notify         = require('gulp-notify');
const pug            = require('gulp-pug');
const rename         = require('gulp-rename');
const sass           = require('gulp-sass');
const sourcemaps     = require('gulp-sourcemaps');
const svgSprite      = require('gulp-svg-sprite');
const uglify         = require('gulp-uglify');

//const babel          = require('gulp-babel');
//const webpack        = require('webpack-stream');

const postcss        = require('gulp-postcss');
const autoprefixer   = require('autoprefixer');
const csso           = require('postcss-csso');
const mqpacker       = require('css-mqpacker');


/* Configuration */

const cfg = require('./gulp/config.js');


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


/* Concatenate Libs scripts and common scripts */

gulp.task('js', function() {
  return gulp.src([

      // libs scripts
      //cfg.src.libs + '/jquery/dist/jquery.min.js',
      cfg.src.libs + '/input-masking/js/input-mask.min.js',
      //cfg.src.libs + '/slick-carousel/slick/slick.min.js',
      //cfg.src.libs + '/owl.carousel/dist/owl.carousel.min.js',

      // app scripts
      cfg.src.js + '/app.js',
    ])
    .pipe(sourcemaps.init())
    //.pipe(babel({
    //    presets: ['env']
    //}))
    .pipe(concat('scripts.min.js'))
    //.pipe(uglify())   // optional, if lib scripts not minimized
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(cfg.src.js))
    .pipe(browserSync.reload({ stream: true }));
});



/* Magic with sass files */

gulp.task('sass', function() {
  const plugins = [
    mqpacker(),
    autoprefixer({browsers: cfg.browserslist}),
    csso({restructure: false}),
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
    .pipe(browserSync.stream());
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
  gulp.watch( cfg.src.svg  + '/**/*.svg', ['sprites']);
  gulp.watch( cfg.src.pug  + '/**/*.pug', ['pug']);
  gulp.watch( cfg.src.sass + '/**/*.{sass,scss}', ['sass']);
  gulp.watch([cfg.src.libs + '/**/*.js', cfg.src.js + '/**/*.js' ], ['js']);
  gulp.watch( cfg.src.root + '/*.html', browserSync.reload);
});



/* Image optimization */

gulp.task('imagemin', function() {
  return gulp.src([cfg.src.img + '/**/*', '!' + cfg.src.img + '/sprites/**/*'])
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
  return gulp.src(cfg.src.svg + '/**/*.svg')
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
              dest: 'generated/_sprite.scss',
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
              dest: 'generated/_sprite-symbol.scss',
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

const options = {
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

  const buildHtml = gulp.src([
    'src/*.html',
  ]).pipe(gulp.dest('dist'));

  const buildSprites = gulp.src([
    cfg.src.img + '/sprites/**/*.svg',
  ]).pipe(gulp.dest(cfg.dest.img + '/sprites'));
  
  const buildCss = gulp.src([
    'src/css/main.min.css',
  ]).pipe(gulp.dest('dist/css'));

  const buildJs = gulp.src([
    'src/js/scripts.min.js',
  ]).pipe(gulp.dest('dist/js'));

  const buildFonts = gulp.src([
    'src/fonts/**/*',
  ]).pipe(gulp.dest('dist/fonts'));

});



/* Helpers */

gulp.task('removedist', function() { return del.sync(cfg.dest.root); });



/* Go! */

gulp.task('default', ['watch']);
