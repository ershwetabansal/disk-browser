var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var runSequence = require('run-sequence');

gulp.task('sass', function(){
    return gulp.src('public/sass/app.scss')
        .pipe(sass()) // Converts Sass to CSS with gulp-sass
        .pipe(gulp.dest('public/app/build/css'));
});


var Server = require('karma').Server;

gulp.task('unit_test', function (done) {
    return new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('browserify', function() {
    return browserify('public/js/Fbrowser/controllers/browser.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('bundle.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('public/app/build/js'));
});

gulp.task('watch', function(){
  gulp.watch('public/sass/*.scss', ['sass']);
  gulp.watch('public/js/Fbrowser/**/*.js', ['browserify']);
});

gulp.task('test_watch', function(){
    gulp.watch('public/js/Fbrowser/**/*.js', ['unit_test']);
    gulp.watch('tests/unit/**/*.js', ['unit_test']);
});


gulp.task('default', function (callback) {
    runSequence(['sass', 'browserify'],
        callback
    )
});