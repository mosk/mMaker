'use strict'

var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var mqpacker = require('css-mqpacker');
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var rimraf = require('rimraf');
var inky = require('inky');
var htmlbeautify = require('gulp-html-beautify');

var path = {
    build: {
        html: 'build/',
        css: 'build/css',
        img: 'build/image'
    },
    src: {
        html: 'src/*.html',
        css: 'src/less/style.less',
        img: 'src/image/*.*'
    },
    watch: {
        html: 'src/*.html',
        css: 'src/less/**/*.*',
        img: 'src/image/*.*'
    }
};

gulp.task('buildHtml', function() {
    gulp.src('src/*.html')
        .pipe(inky())
        .pipe(gulp.dest('build/'))
        .pipe(server.stream());
});

gulp.task('buildCss', function() {
    gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(less())
        .pipe(postcss([
            autoprefixer({
                browsers: [
                    "last 3 versions"
                ]
            }),
            mqpacker({
                sort: true
            })
        ]))
        .pipe(gulp.dest(path.build.css))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest(path.build.css))
        .pipe(server.stream());
});

gulp.task('buildImg', function() {
    gulp.src(path.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(gulp.dest(path.build.img))
        .pipe(server.stream());
});

gulp.task('htmlbeautify', function() {
  var options = {
    'indent_size': 4
  };
  gulp.src('build/*.html')
    .pipe(htmlbeautify(options))
    .pipe(gulp.dest('build'))
});

gulp.task('build', [
    'buildCss',
    'buildHtml',
    'buildImg',
    'htmlbeautify'
]);

gulp.task('serve', ['build'], function() {
    server.init({
        server: './build',
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch(path.watch.css, ['buildCss']);
    gulp.watch(path.watch.html, ['buildHtml']);
    gulp.watch('build/index.html', ['htmlbeautify']);
    gulp.watch(path.watch.img, ['buildImg']);
});

gulp.task('clean', function(cb) {
    rimraf(path.build.html, cb);
});