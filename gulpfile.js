/* Modules */

const gulp = require('gulp');

const browserSync = require('browser-sync').create();
const del = require('del');
const googleWebFonts = require('gulp-google-webfonts');

const imagemin = require('gulp-imagemin');
const webp = require('imagemin-webp');
const zip = require('gulp-zip');

const notify = require('gulp-notify');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const svgSprite = require('gulp-svg-sprite');

const webpack = require('webpack-stream');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const mqpacker = require('postcss-combine-media-query');

/* Configuration */

const SRC_PATH = 'src';
const DIST_PATH = 'dist';

const app = {
  env: process.env.NODE_ENV || 'development',

  src: {
    root: SRC_PATH,
    html: SRC_PATH,
    pug: `${SRC_PATH}/pug`,
    sass: `${SRC_PATH}/sass`,
    css: `${SRC_PATH}/css`,
    // path for sass files that will be generated automatically
    sassGen: `${SRC_PATH}/sass/generated`,
    js: `${SRC_PATH}/js`,
    img: `${SRC_PATH}/img`,
    svg: `${SRC_PATH}/img/svg`,
    fonts: `${SRC_PATH}/fonts`,
  },

  dist: {
    root: DIST_PATH,
    html: DIST_PATH,
    css: `${DIST_PATH}/css`,
    js: `${DIST_PATH}/js`,
    img: `${DIST_PATH}/img`,
    fonts: `${DIST_PATH}/fonts`,
  },
};

/* ====== Tasks ====== */

/* Pug Views to Html Compile*/

const html = () => {
  return gulp
    .src([`${app.src.pug}/pages/**/*.pug`, `!${app.src.pug}/**/_*.pug`])
    .pipe(
      pug({
        basedir: app.src.pug,
        pretty: true,
      })
    )
    .on('error', notify.onError())
    .pipe(gulp.dest(app.src.root))
    .pipe(browserSync.stream());
};

exports.html = html;

/* Import and build scripts */

const js = () => {
  return gulp
    .src(`${app.src.js}/index.js`)
    .pipe(
      webpack({
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    ['@babel/preset-env', {targets: app.browserslist}],
                  ],
                  // see https://babeljs.io/docs/en/plugins
                  // plugins: ['@babel/plugin-transform-arrow-functions']
                },
              },
            },
          ],
        },
        mode: app.env,
        devtool: app.env === 'development' ? 'source-map' : false,
        output: {
          filename: 'app.min.js',
        },
      })
    )
    .pipe(gulp.dest(app.src.js))
    .pipe(browserSync.stream());
};

exports.js = js;

/* Magic with sass files */

const styles = () => {
  const plugins = [mqpacker, autoprefixer, csso({ restructure: false })];
  return gulp
    .src(`${app.src.sass}/**/*.{sass,scss}`)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded', // nested, expanded, compact, compressed
      })
    )
    .on(
      'error',
      notify.onError({
        title: '<%= error.plugin %> in <%= error.relativePath %>',
        message:
          '<%= error.messageOriginal %>\nLine: <%= error.line %>, <%= error.column %>',
        sound: true,
      })
    )
    .pipe(gulp.dest(app.src.css))
    .pipe(postcss(plugins))
    .pipe(rename({suffix: '.min', prefix: ''}))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(app.src.css))
    .pipe(browserSync.stream());
};

exports.styles = styles;

/* Browser Sync Server */

const serve = (cb) => {
  browserSync.init({
    server: {
      baseDir: app.src.root,
    },
    notify: false,
    open: true,
  });
  cb();
};

const serveDist = (cb) => {
  browserSync.init({
    server: {
      baseDir: app.dist.root,
    },
    notify: false,
    open: true,
  });
  cb();
};

exports.serveDist = serveDist;

/* Monitoring */

const watch = () => {
  gulp.watch(`${app.src.svg}/**/*.svg`, gulp.series(sprites, html));
  gulp.watch(`${app.src.img}/**/*.{png,jpg}`, createWebp);
  gulp.watch(`${app.src.pug}/**/*.pug`, html);
  gulp.watch(`${app.src.sass}/**/*.{sass,scss}`, styles);
  gulp.watch([`${app.src.js}/**/*.js`, `!${app.src.js}/app.min.js`], js);
  gulp.watch(`${app.src.root}/*.html`).on('change', browserSync.reload);
};

exports.watch = watch;

/* Image optimization */

const imageopt = () => {
  return gulp
    .src([
      `${app.src.img}/**/*.{jpg,png,svg,webp,ico,mp4}`,
      `!${app.src.img}/sprites/**/*`,
    ])
    .pipe(
      imagemin([
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.svgo({
          plugins: [
            {removeViewBox: true},
            {cleanupIDs: false},
            {removeUselessStrokeAndFill: false},
          ],
        }),
      ])
    )
    .pipe(gulp.dest(app.dist.img));
};

exports.imageopt = imageopt;

const createWebp = () => {
  return gulp
    .src(`${app.src.img}/**/*.{png,jpg}`, {nodir: true})
    .pipe(
      imagemin([
        webp({
          quality: 90,
        }),
      ])
    )
    .pipe(rename({extname: '.webp'}))
    .pipe(gulp.dest(app.src.img));
};

exports.createWebp = createWebp;

/* Generate SVG Sprites */

const sprites = () => {
  return gulp
    .src(`${app.src.svg}/**/*.svg`)
    .pipe(
      svgSprite({
        shape: {
          spacing: {
            padding: 0,
          },
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
                template: 'src/img/sprites/tmpl/sprite.scss',
              },
            },
            example: {
              dest: '../img/sprites/sprite.html',
            },
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
              },
            },
            example: {
              dest: '../img/sprites/sprite-symbol.html',
            },
          },
        },
      })
    )
    .pipe(gulp.dest(app.src.root));
};

exports.sprites = sprites;

/* Download Google Fonts */

const options = {
  fontsDir: '../fonts/',
  cssDir: '../sass/',
  cssFilename: 'generated/_webfonts.css',
};

exports.fonts = () => {
  return gulp
    .src(`${app.src.fonts}/fonts.list`)
    .pipe(googleWebFonts(options))
    .pipe(gulp.dest(app.src.fonts));
};

/* Helpers */

const clean = (cb) => {
  del.sync(app.dist.root);
  cb();
};

const zipProject = () =>
  gulp
    .src([
      'src/**/*',
      'dist/**/*',
      'gulpfile.js',
      'package.json',
      'package-lock.json',
      '.eslintrc.json',
      '.editorconfig',
      'readme.md',
    ], {base: '.'})
    .pipe(zip('project.zip'))
    .pipe(gulp.dest('.'));

exports.zipProject = zipProject;

/* Build project */

const build = gulp.series(
  clean,
  gulp.parallel(sprites, createWebp),
  imageopt,
  gulp.parallel(html, styles, js),

  (copyAssets = (cb) => {
    const copyHtml = gulp
      .src([`${app.src.root}/*.html`])
      .pipe(gulp.dest(app.dist.root));

    const copySprites = gulp
      .src([`${app.src.img}/sprites/**/*.svg`])
      .pipe(gulp.dest(`${app.dist.img}/sprites`));

    const copyCss = gulp
      .src([`${app.src.css}/main.min.css`])
      .pipe(gulp.dest(app.dist.css));

    const copyJs = gulp
      .src([`${app.src.js}/app.min.js`])
      .pipe(gulp.dest(app.dist.js));

    const copyFonts = gulp
      .src([`${app.src.fonts}/**/*`])
      .pipe(gulp.dest(app.dist.fonts));

    cb();
  })
);

exports.build = build;

/* Go! */

exports.default = gulp.series(
  gulp.parallel(html, styles, js, createWebp),
  gulp.parallel(serve, watch)
);
