/* Modules */

const gulp           = require('gulp');

const browserSync    = require('browser-sync');
const del            = require('del');
const concat         = require('gulp-concat');
const fileinclude    = require('gulp-file-include');
const googleWebFonts = require('gulp-google-webfonts');

const imagemin       = require('gulp-imagemin');

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

const srcPath = 'src';
const destPath = 'dist';

const cfg = {

  // Share browsers list between different front-end tools, like Autoprefixer, Stylelint and babel-env-preset. http://browserl.ist/
  browserslist   : ['last 2 versions'],

  src: {
    root         : srcPath + '',
    templates    : srcPath + '/templates',
    pug          : srcPath + '/pug',
    sass         : srcPath + '/sass',
    css          : srcPath + '/css',
    // path for sass files that will be generated automatically via some of tasks
    sassGen      : srcPath + '/sass/generated',
    js           : srcPath + '/js',
    img          : srcPath + '/img',
    svg          : srcPath + '/img/svg',
    fonts        : srcPath + '/fonts',
    libs         : srcPath + '/libs'
  },

  dest: {
    root : destPath,
    html : destPath,
    css  : destPath + '/css',
    js   : destPath + '/js',
    img  : destPath + '/img',
    fonts: destPath + '/fonts',
    libs : destPath + '/libs'
  },
};


/* ====== Tasks ====== */

/* Html with includes */

gulp.task('html', function() {
  return gulp.src([
      cfg.src.templates + '/**/*.html', 
      '!' + cfg.src.templates + '/**/_*.html'
    ])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(gulp.dest(cfg.src.root));
});


/* Pug Views Compile*/

gulp.task('pug', function() {
  return gulp.src([
      cfg.src.pug + '/**/*.pug', 
      '!' + cfg.src.pug + '/**/_*.pug'
    ])
    .pipe(pug({
      basedir: cfg.src.pug,
      pretty: true
    })).on('error', notify.onError())
    .pipe(gulp.dest(cfg.src.root))
    .pipe(browserSync.reload({ stream: true }));
});


/* Concatenate Libs scripts and common scripts */

gulp.task('js', function() {
  return gulp.src([

      // libs scripts
      //cfg.src.libs + '/jquery/dist/jquery.min.js',
      cfg.src.libs + '/jquery/dist/jquery.slim.min.js',
      cfg.src.libs + '/input-masking/js/input-mask.min.js',
      cfg.src.libs + '/slick-carousel/slick/slick.min.js',
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
  return gulp.src(cfg.src.sass + '/**/*.{sass,scss}')
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
    open: false,
    // tunnel: true,
    // tunnel: 'projectName', //Demonstration page: http://projectName.localtunnel.me
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
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: true,
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
    .pipe(gulp.dest(cfg.src.root));
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
    .pipe(gulp.dest(cfg.src.fonts));
});


/* Build project */

gulp.task('build', ['removedist', 'imagemin', 'pug', 'sass', 'js'], function() {

  const copyHtml = gulp.src([
    cfg.src.root + '/*.html',
  ]).pipe(gulp.dest(cfg.dest.root));

  const copySprites = gulp.src([
    cfg.src.img + '/sprites/**/*.svg',
  ]).pipe(gulp.dest(cfg.dest.img + '/sprites'));
  
  const copyCss = gulp.src([
    cfg.src.css + '/main.min.css',
  ]).pipe(gulp.dest(cfg.dest.css));

  const copyJs = gulp.src([
    cfg.src.js + '/scripts.min.js',
  ]).pipe(gulp.dest(cfg.dest.js));

  const copyFonts = gulp.src([
    cfg.src.fonts + '/**/*',
  ]).pipe(gulp.dest(cfg.dest.fonts));

});



/* Helpers */

gulp.task('removedist', function() { 
  return del.sync(cfg.dest.root); 
});



/* Go! */

gulp.task('default', ['watch']);
