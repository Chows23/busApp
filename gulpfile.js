const {src, dest, series, parallel} = require('gulp');

const concat = require('gulp-concat');

const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const cssnano = require('gulp-cssnano');

function htmlTask() {
  return src('src/*.html')
    .pipe(dest('dist'))
};

function styleTask() {
  return src(['src/normalize.css', 'src/style.css'])
    .pipe(concat('all.css'))
    .pipe(sourcemaps.init())
    .pipe(cssnano())
    .pipe(sourcemaps.write())
    .pipe(dest('dist/css'))
};

function scriptTask() {
  return src('src/*.js')
    .pipe(concat('main.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('dist/js'))
}


exports.default = series(htmlTask, styleTask, scriptTask);