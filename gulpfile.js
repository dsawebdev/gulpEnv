var gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject'),
    htmlclean = require('gulp-htmlclean'),
    cleanCSS = require('gulp-clean-css'),
    webserver = require('gulp-webserver'),
    pump = require('pump'),
    gutil = require('gulp-util'),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    del = require('del');

var paths = {
  src: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcSCSS: 'src/**/*.scss',
  srcJS: 'src/**/*.js',
  srcIMG: 'src/img/**/*',
  srcFavi: 'src/**/*.ico',

  tmp: 'tmp',
  tmpIndex: 'tmp/**/*.html',
  tmpCSS: 'tmp/**/*.css',
  tmpJS: 'tmp/**/*.js',
  tmpIMG: 'tmp/img/**/*',

  dist: 'dist',
  distIndex: 'dist/index.html',
  distCSS: 'dist/**/*.css',
  distJS: 'dist/**/*.js'
}

//--Functions for sending src files to tmp folder and running webserver off of tmp folder
gulp.task('html', function () {
  return gulp.src(paths.srcHTML)
  .pipe(gulp.dest(paths.tmp));
});

gulp.task('assets', function () {
  return gulp.src(paths.srcFavi)
  .pipe(gulp.dest(paths.tmp));
});

gulp.task('css', function () {
  return gulp.src(paths.srcSCSS)
    .pipe(sass({style: 'compressed'}))
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('js', function () {
  return gulp.src(paths.srcJS)
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('img', function () {
  return gulp.src(paths.srcIMG)
    .pipe(gulp.dest('tmp/img'));
})

//Copy will run all 3 Gulp task above
gulp.task('copy', ['html', 'css', 'js', 'img', 'assets']);

//Inject will run copy first and inject CSS and JS into index.html in tmp folder
gulp.task('inject', ['copy'], function () {
  var css = gulp.src(paths.tmpCSS);
  var js = gulp.src(paths.tmpJS);
  return gulp.src(paths.tmpIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.tmp))
});


gulp.task('serve', ['inject'], function () {  
  return gulp.src(paths.tmp)
    .pipe(webserver({
      port: 4200,
      livereload: {auto: false}, 
      open: true
    }));
});

gulp.task('watch', ['serve'], function () {
  return gulp.watch(paths.src, ['inject']);
});

gulp.task('default', ['watch'])

//--Functions for Build to Dist-----
gulp.task('html:dist', function () {
  return gulp.src(paths.srcHTML)
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('assets:dist', function () {
  return gulp.src(paths.srcFavi)
    .pipe(gulp.dest(paths.dist))
});

gulp.task('css:dist', function () {
  return gulp.src(paths.tmpCSS)
    .pipe(concat('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('img:dist', function () {
  return gulp.src(paths.tmpIMG)
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'));
});

gulp.task('js:dist', function () {
  return gulp.src(paths.srcJS)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist', 'img:dist', 'assets:dist']);

gulp.task('inject:dist', ['copy:dist'], function () {
  var css = gulp.src(paths.distCSS);
  var js = gulp.src(paths.distJS);
  return gulp.src(paths.distIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['inject:dist']);

//--Function for sending structure to Github - the tmp and dist folders
gulp.task('clean', function () {
  del([paths.tmp, paths.dist]);
});

