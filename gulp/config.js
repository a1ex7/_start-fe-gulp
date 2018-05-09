var srcPath = 'src';
var destPath = 'dist';

var config = {

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
    icons        : srcPath + '/icons',
    // path to png sources for sprite:png task
    iconsPng     : srcPath + '/icons',
    // path to svg sources for sprite:svg task
    iconsSvg     : srcPath + '/icons',
    // path to svg sources for iconfont task
    iconsFont    : srcPath + '/icons',
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

module.exports = config;