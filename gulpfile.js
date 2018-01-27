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
      'build_sources',
    ], cb);
});

// DEVELOPMENT

gulp.task('watch', function(cb) {

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


