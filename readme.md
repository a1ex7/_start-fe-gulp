# Starter Project


Description

## Getting started

1. Install Node Modules: `npm install`
2. Run the template: `npm run dev` or
3. Build template: `npm run build`


## Gulp tasks:

- **`gulp`**: run default gulp task (sass, js, watch, browserSync) for web development
- **`build`**: build project to `dist` folder (cleanup, image optimize, removing unnecessary files)


## Rules for working with the project

- Two ways for HTML compile:
  - from pug partials in `src/pug` folder (**default**)
  - from html partials in `src/templates` folder
- Custom JS located in **`src/js/index.js`**
- Sass vars placed in **`src/sass/helpers/_variables.sass`**
- All media queries placed in **`src/sass/helpers/_media.sass`**
- All libraries styles placed in **`src/sass/helpers/_libs.sass`**
- SVG images placed in `src/img/svg` compile into svg sprites, 
- other images in `src/img` optimizing and copy `dist` folder
