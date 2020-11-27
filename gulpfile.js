/* Modules */

const gulp = require('gulp');

const browserSync = require('browser-sync').create();
const del = require('del');
const googleWebFonts = require('gulp-google-webfonts');

const imagemin = require('gulp-imagemin');
const webp = require('imagemin-webp');

const notify = require('gulp-notify');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const svgSprite = require('gulp-svg-sprite');

const webpack = require('webpack-stream');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('postcss-csso');
const mqpacker = require('css-mqpacker');

/* Configuration */

const srcPath = 'src';
const distPath = 'dist';

const cfg = {
  env: 'development',

  src: {
    root: srcPath,
    pug: `${srcPath}/pug`,
    sass: `${srcPath}/sass`,
    css: `${srcPath}/css`,
    // path for sass files that will be generated automatically
    sassGen: `${srcPath}/sass/generated`,
    js: `${srcPath}/js`,
    img: `${srcPath}/img`,
    svg: `${srcPath}/img/svg`,
    fonts: `${srcPath}/fonts`,
  },

  dist: {
    root: distPath,
    html: distPath,
    css: `${distPath}/css`,
    js: `${distPath}/js`,
    img: `${distPath}/img`,
    fonts: `${distPath}/fonts`,
  },

  setEnv: function (env) {
    if (typeof env !== 'string') return;
    this.env = env;
  },
};

/* ====== Tasks ====== */

/* Pug Views to Html Compile*/

const html = () => {
  return gulp
    .src([`${cfg.src.pug}/**/*.pug`, `!${cfg.src.pug}/**/_*.pug`])
    .pipe(
      pug({
        basedir: cfg.src.pug,
        pretty: true,
      })
    )
    .on('error', notify.onError())
    .pipe(gulp.dest(cfg.src.root))
    .pipe(browserSync.stream());
};

exports.html = html;

/* Import and build scripts */

const js = () => {
  return gulp
    .src(`${cfg.src.js}/index.js`)
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
                    ['@babel/preset-env', { targets: cfg.browserslist }],
                  ],
                  // see https://babeljs.io/docs/en/plugins
                  // plugins: ['@babel/plugin-transform-arrow-functions']
                },
              },
            },
          ],
        },
        mode: cfg.env,
        devtool: cfg.env === 'development' ? 'source-map' : 'none',
        output: {
          filename: 'app.min.js',
        },
      })
    )
    .pipe(gulp.dest(cfg.src.js))
    .pipe(browserSync.stream());
};

exports.js = js;

/* Magic with sass files */

const styles = () => {
  const plugins = [mqpacker(), autoprefixer(), csso({ restructure: false })];
  return gulp
    .src(`${cfg.src.sass}/**/*.{sass,scss}`)
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
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: '.min', prefix: '' }))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(cfg.src.css))
    .pipe(browserSync.stream());
};

exports.styles = styles;

/* Browser Sync Server */

const server = (done) => {
  browserSync.init({
    server: {
      baseDir: cfg.src.root,
    },
    notify: false,
    open: false,
    cors: true,
    // proxy: 'yourlocal.dev',
  });
  done();
};

exports.server = server;

/* Monitoring */

const watch = () => {
  // gulp.watch(`${cfg.src.templates}/**/*.html`, gulp.series(html));
  gulp.watch(`${cfg.src.svg}/**/*.svg`, gulp.series(sprites));
  gulp.watch(`${cfg.src.img}/**/*.{png,jpg}`, gulp.series(createWebp));
  gulp.watch(`${cfg.src.pug}/**/*.pug`, gulp.series(html));
  gulp.watch(`${cfg.src.sass}/**/*.{sass,scss}`, gulp.series(styles));
  gulp.watch(
    [`${cfg.src.js}/**/*.js`, `!${cfg.src.js}/app.min.js`],
    gulp.series('js')
  );
  gulp.watch(`${cfg.src.root}/*.html`, browserSync.reload);
};

exports.watch = watch;

/* Image optimization */

const imageopt = () => {
  return gulp
    .src([`${cfg.src.img}/**/*.{jpg,png,svg}`, `!${cfg.src.img}/sprites/**/*`])
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: true,
              cleanupIDs: false,
              removeUselessStrokeAndFill: true,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest(cfg.dist.img));
};

exports.imageopt = imageopt;

const createWebp = () => {
  return gulp
    .src(`${cfg.src.img}/**/*.{png,jpg}`, { nodir: true })
    .pipe(
      imagemin([
        webp({
          quality: 75,
        }),
      ])
    )
    .pipe(rename({ extname: '.webp' }))
    .pipe(gulp.dest(cfg.src.img));
};

exports.createWebp = createWebp;

/* Generate SVG Sprites */

const sprites = () => {
  return gulp
    .src(`${cfg.src.svg}/**/*.svg`)
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
    .pipe(gulp.dest(cfg.src.root));
};

exports.sprites = sprites;

/* Download Google Fonts */

const options = {
  fontsDir: '../fonts/',
  cssDir: '../sass/',
  cssFilename: 'generated/webfonts.css',
};

const fonts = () => {
  return gulp
    .src(`${cfg.src.fonts}/fonts.list`)
    .pipe(googleWebFonts(options))
    .pipe(gulp.dest(cfg.src.fonts));
};

exports.fonts = fonts;

/* Helpers */

const clean = (done) => {
  del.sync(cfg.dist.root);
  done();
};

exports.clean = clean;

/* Build project */

const build = gulp.series(
  (setEnvProduction = (done) => {
    cfg.setEnv('production');
    done();
  }),
  clean,
  gulp.parallel(sprites, createWebp),
  imageopt,
  gulp.parallel(html, styles, js),

  (copyAssets = (done) => {
    const copyHtml = gulp
      .src([`${cfg.src.root}/*.html`])
      .pipe(gulp.dest(cfg.dist.root));

    const copySprites = gulp
      .src([`${cfg.src.img}/sprites/**/*.svg`])
      .pipe(gulp.dest(`${cfg.dist.img}/sprites`));

    const copyCss = gulp
      .src([`${cfg.src.css}/main.min.css`])
      .pipe(gulp.dest(cfg.dist.css));

    const copyJs = gulp
      .src([`${cfg.src.js}/app.min.js`])
      .pipe(gulp.dest(cfg.dist.js));

    const copyFonts = gulp
      .src([`${cfg.src.fonts}/**/*`])
      .pipe(gulp.dest(cfg.dist.fonts));

    done();
  })
);

exports.build = build;

/* Go! */

exports.default = gulp.series(
  (setEnvDevelopment = (done) => {
    cfg.setEnv('development');
    done();
  }),
  gulp.parallel(html, styles, js, createWebp),
  gulp.parallel(server, watch)
);
