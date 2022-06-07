const del = require('del');
const gulp = require('gulp');
const cached = require('gulp-cached');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");    
const cleanCSS = require('gulp-clean-css');
const rtlcss = require('gulp-rtlcss');
const npmdist = require('gulp-npm-dist');

const srcDir = 'originSrc';
const distDir = 'public/assets';

gulp.task('js', function() {
    return gulp
        .src([srcDir + '/js/**/*.js', srcDir + '/js/**/*.min.js'], { base: srcDir + '/js' })
        .pipe(uglify())
        .pipe(gulp.dest(distDir + '/js'));
});

gulp.task('fonts', function() {
    return gulp
        .src([srcDir + '/fonts/**/*'], { base: srcDir + '/fonts' })
        .pipe(gulp.dest(distDir + '/fonts'));
});

gulp.task('scss', function () {
    gulp
        .src([srcDir + '/scss/*.scss'], { base: srcDir + '/scss' })
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(distDir + '/css'))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write("./")) 
        .pipe(gulp.dest(distDir + '/css'));

    return gulp
        .src([srcDir + '/scss/*.scss'], { base: srcDir + '/scss' })
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rtlcss())
        .pipe(gulp.dest(distDir + '/css'))
        .pipe(rename({ suffix: "-rtl.min" }))
        .pipe(sourcemaps.write("./")) 
        .pipe(gulp.dest(distDir + '/css'));
});

gulp.task('img', function() {
    return gulp
        .src([srcDir + '/images/**/*'], { base: srcDir + '/images' })
        .pipe(cached('img'))
        .pipe(gulp.dest(distDir + '/images'));
});

gulp.task('libs', function() {
    return gulp
      .src(npmdist(), { base: 'node_modules' })
      .pipe(cached('libs'))
      .pipe(rename(function(path) { path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, ''); }))
      .pipe(gulp.dest(distDir + '/libs'));
});

gulp.task('clean:packageLock', function(callback) {
    del.sync('package-lock.json');
    callback();
});

gulp.task('clean:dist', function(callback) {
    del.sync(distDir);
    callback();
});

gulp.task('default', gulp.series(gulp.parallel('clean:packageLock', 'clean:dist', 'libs', 'img', 'js', 'fonts', 'scss')));