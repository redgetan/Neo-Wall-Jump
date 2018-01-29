var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  buffer = require('vinyl-buffer'),
  connect = require('gulp-connect'),
  source = require('vinyl-source-stream'),
  concat = require('gulp-concat'),
  merge = require('merge-stream'),
  process = require('process'),
  rename = require('gulp-rename'),
  runSequence = require('run-sequence')


paths = {
  entry: './src/main.js',
  dist: './dist/'
};

gulp.task('build_sources', function() {
  var app = browserify(paths.entry)
                    .bundle()
                    .pipe(source('app.js'))
                    .pipe(buffer())
                    .pipe(babel({
                      presets: [
                        ["es2015", { "modules": false }]
                      ]
                    }))
                    .pipe(uglify())
                    .pipe(gulp.dest(paths.dist));

  return app;
});

gulp.task('build', function(cb) {
  runSequence([
      'copy_html',
      'copy_lib',
      'copy_resources',
      'build_sources',
    ], cb);
});

// DEVELOPMENT
gulp.task('watch', function(cb) {
  runSequence([
      'copy_html',
      'copy_lib',
      'copy_resources',
      'compile_javascript',
    ], cb);
});

gulp.task('copy_html', function(cb) {
  gulp.src("./src/index.html").pipe(gulp.dest(paths.dist))
});

gulp.task('copy_lib', function(cb) {
  gulp.src("./src/lib/**/*").pipe(gulp.dest(paths.dist + "/lib"))
});

gulp.task('copy_resources', function(cb) {
  gulp.src("./src/assets/**/*").pipe(gulp.dest(paths.dist + "/assets"))
});

gulp.task('compile_javascript', function(cb) {

  var bundler = browserify(paths.entry, watchify.args);

  var bundle = function() {
    console.log("rebuilding app.js")

    bundler
      .bundle()
      .on('error', function (e) {throw e;})
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(connect.reload())
      .pipe(gulp.dest(paths.dist))
  }

  watchified = watchify(bundler);
  watchified.on('update', bundle);

  return bundle();
});


