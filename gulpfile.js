var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var runSequence = require('run-sequence');
var minify = require('gulp-minify');

gulp.task('sass', function(){
    return gulp.src('src/sass/disk-browser.scss')
        .pipe(sass()) // Converts Sass to CSS with gulp-sass
        .pipe(gulp.dest('dist/css'));
});


var Server = require('karma').Server;

gulp.task('unit_test', function (done) {
    return new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('browserify', function() {
    return browserify('src/js/Fbrowser/controllers/browser.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('disk-browser.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', function(){
  gulp.watch('src/sass/*.scss', ['sass']);
  gulp.watch('src/js/Fbrowser/**/*.js', ['browserify']);
});

gulp.task('test_watch', function(){
    gulp.watch('src/js/Fbrowser/**/*.js', ['unit_test']);
    gulp.watch('tests/unit/**/*.js', ['unit_test']);
});

gulp.task('copyPartial', function() {
    gulp.src('./src/partials/disk-browser.html')
        .pipe(gulp.dest('dist/partials'));
});

gulp.task('compress', function() {
  gulp.src('dist/js/disk-browser.js')
    .pipe(minify({
        ext:{
            src:'.js',
            min:'.min.js'
        },
        exclude: ['tasks'],
        ignoreFiles: []
    }))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('default', function (callback) {
    runSequence(['sass', 'browserify', 'copyPartial', 'compress'],
        callback
    )
});

