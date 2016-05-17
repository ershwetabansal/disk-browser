var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var runSequence = require('run-sequence');

gulp.task('sass', function(){
    return gulp.src('src/sass/app.scss')
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
        .pipe(source('bundle.js'))
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


gulp.task('default', function (callback) {
    runSequence(['sass', 'browserify'],
        callback
    )
});