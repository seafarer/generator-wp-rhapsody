/**
 * Front end tasks.
 */

'use strict';

var gulp          = require('gulp');
var plumber       = require('gulp-plumber');
var sass          = require('gulp-sass');
var sourcemap     = require('gulp-sourcemaps');
var autoprefixer  = require('gulp-autoprefixer');
var notify        = require('gulp-notify');
var iconfont      = require('gulp-iconfont');
var consolidate   = require('gulp-consolidate');
var cache         = require('gulp-cache');
var imagemin      = require('gulp-imagemin');
var concat        = require('gulp-concat');
var uglify        = require('gulp-uglify');
var browserSync   = require('browser-sync').create();

// Define variables for our paths
var paths = {
  sass: ['./sass/*.scss', './sass/**/*.scss'],
  files: '**/*.php',
  js: './js/*.js',
  img: './images/*.{jpg,png,gif,svg}',
  css: './'
};

// Sass error function
function errorAlert(error){
  notify.onError({
    title: 'SCSS Error',
    message: 'Check your terminal',
    sound: 'Sosumi'
  })(error);
  console.log(error.toString());
  this.emit('end');
}

// Browser Sync
gulp.task('serve', function() {
  browserSync.init({
    proxy: 'one.dev'
  });

  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.img, ['img']).on('change', browserSync.reload);
  gulp.watch(paths.files).on('change', browserSync.reload);
  gulp.watch(paths.js).on('change', browserSync.reload);
  gulp.watch('app/*.html').on('change', browserSync.reload);
});

// Sass Tasks
// Set Sass and Autoprefix options here
gulp.task('sass', function() {
  return gulp.src(paths.sass)
    .pipe(plumber({errorHandler: errorAlert}))
    .pipe(sourcemap.init({loadMaps: true}))
    .pipe(sass())
    .on('error', notify.onError({
      message: 'Error: <%= error.message %>'
    }))
    .pipe(autoprefixer('> 0.25%'))
    .pipe(sourcemap.write('./maps'))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.stream());
});

// Minify images and set up the folder for livereload. First run
// will minify all images, subsequent runs will minify only new or
// modified files
gulp.task('img', function () {
  return gulp.src(paths.img)
    .pipe(cache(imagemin({optimizationLevel: 3, verbose: true})))
    .pipe(gulp.dest('images/'));
});

gulp.task('js', function() {
  return gulp.src([
      'js/vendor/*.js',
      'js/app.js'
    ])
    .pipe(concat('one.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'));
});

// Define default task
gulp.task('default', ['serve']);

// Create icon font from a folder of SVGs
// Has to be run separately from default task
// To use, run `gulp icons`
gulp.task('icons', function () {
  gulp.src(['icons/*.svg'])
    .pipe(iconfont({
      fontName: 'icons',
      appendCodepoints: true,
      normalize: true
    }))
    .on('codepoints', function (codepoints, options) {
      gulp.src('sass/typography/_icons-template.scss')
        .pipe(consolidate('lodash', {
          glyphs: codepoints,
          fontName: 'icons',
          fontPath: 'fonts/icons/',
          className: 'icon'
        }))
        .pipe(gulp.dest('sass/elements'));
    })
    .pipe(gulp.dest('fonts/icons'));
});

// Clear the gulp cache - run `gulp clear`
gulp.task('clear', function (done) {
  return cache.clearAll(done);
});
