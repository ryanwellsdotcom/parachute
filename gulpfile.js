/////////////////////////////////////////////////////////////////////

// external js/css dependencies
const vendorStyles = ['node_modules/normalize.css/normalize.css'];
const vendorScripts = []; // 'node_modules/jquery/dist/jquery.min.js'

/////////////////////////////////////////////////////////////////////

// plugins
const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const stripDebug = require('gulp-strip-debug');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const del = require('del');
const connect = require('gulp-connect');
const open = require('gulp-open');
const inject = require('gulp-inject');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');

sass.compiler = require('node-sass');

// optimize images
gulp.task('imagemin', function () {
  return gulp
    .src('app/src/img/**/*')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(gulp.dest('temp/img'));
});

// compile sass
gulp.task('compile:sass', function () {
  return gulp
    .src(['app/src/scss/main.scss', 'app/src/scss/print.scss'])
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('temp/css'));
});

// autoprefix css
gulp.task('autoprefix:css', function () {
  return gulp
    .src('temp/css/main.css')
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(gulp.dest('temp/css'));
});

// concatenate css
gulp.task('concatenate:css', function () {
  return gulp
    .src([...vendorStyles, 'temp/css/main.css'])
    .pipe(concat('main.css'))
    .pipe(gulp.dest('temp/css'));
});

// minify & sourcemaps css
gulp.task('minify:css', function () {
  return gulp
    .src(['temp/css/main.css', 'temp/css/print.css'])
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({ compatibility: 'ie11' }))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('temp/css'));
});

// transpile to ES5
gulp.task('babel', function () {
  return gulp
    .src('app/src/js/main.js')
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(gulp.dest('temp/js'));
});

// concatenate vendor js
gulp.task('concatenate:vendor-js', function () {
  if (vendorScripts.length > 0) {
    return gulp
      .src(vendorScripts)
      .pipe(concat('vendor.js'))
      .pipe(gulp.dest('temp/js'));
  } else {
    return gulp.src('app/src/js/vendor.js').pipe(gulp.dest('temp/js'));
  }
});

// minify js
gulp.task('minify:js', function () {
  return gulp
    .src('temp/js/main.js')
    .pipe(sourcemaps.init())
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('temp/js'));
});

// minify runner
gulp.task('minify', gulp.parallel('minify:css', 'minify:js'));

// remove temp folder
gulp.task('clean', function () {
  return del(['temp']);
});

// transfer files dev
gulp.task('dev:transfer-images', function () {
  return gulp.src('temp/img/**/*').pipe(gulp.dest('app/build/dev/dist/img'));
});

gulp.task('dev:transfer-css', function () {
  return gulp
    .src(['temp/css/main.css', 'temp/css/print.css'])
    .pipe(gulp.dest('app/build/dev/dist/css'));
});

gulp.task('dev:transfer-vendor-js', function () {
  return gulp.src('temp/js/vendor.js').pipe(gulp.dest('app/build/dev/dist/js'));
});

gulp.task('dev:transfer-js', function () {
  return gulp.src('temp/js/main.js').pipe(gulp.dest('app/build/dev/dist/js'));
});

gulp.task(
  'dev:transfer',
  gulp.parallel(
    'dev:transfer-images',
    'dev:transfer-css',
    'dev:transfer-vendor-js',
    'dev:transfer-js'
  )
);

// transfer files prod
gulp.task('prod:transfer-images', function () {
  return gulp.src('temp/img/**/*').pipe(gulp.dest('app/build/prod/dist/img'));
});

gulp.task('prod:transfer-css', function () {
  return gulp.src('temp/css/**/*').pipe(gulp.dest('app/build/prod/dist/css'));
});

gulp.task('prod:transfer-vendor-js', function () {
  return gulp.src('temp/js/**/*').pipe(gulp.dest('app/build/prod/dist/js'));
});

gulp.task('prod:transfer-js', function () {
  return gulp.src('temp/js/**/*').pipe(gulp.dest('app/build/prod/dist/js'));
});

gulp.task(
  'prod:transfer',
  gulp.parallel(
    'prod:transfer-images',
    'prod:transfer-css',
    'prod:transfer-vendor-js',
    'prod:transfer-js'
  )
);

// development server
gulp.task('connect-dev', async function () {
  connect.server({
    root: 'app/build/dev',
    port: 3000,
    livereload: true
  });
});

gulp.task('open-dev', async function () {
  return gulp
    .src('app/build/dev/*.html')
    .pipe(open({ uri: 'http://localhost:3000/' }));
});

// production server
gulp.task('connect-prod', async function () {
  connect.server({
    root: 'app/build/prod',
    port: 8080,
    livereload: true
  });
});

gulp.task('open-prod', async function () {
  return gulp
    .src('app/build/prod/*.html')
    .pipe(open({ uri: 'http://localhost:8080/' }));
});

gulp.task('watch', async function () {
  gulp.watch(
    [
      'app/src/img/**/*',
      'app/src/scss/*.scss',
      'app/src/*.html',
      'app/src/js/*.js'
    ],
    gulp.series('dev')
  );
});

// build development
gulp.task('build:dev', function () {
  const target = gulp.src('app/src/index.html');
  const sources = gulp.src(
    ['temp/img/**/*', 'temp/js/main.js', 'temp/css/main.css'],
    { read: false }
  );

  return target
    .pipe(inject(sources))
    .pipe(gulp.dest('app/build/dev'))
    .pipe(connect.reload());
});

// build development runner
gulp.task(
  'dev',
  gulp.series(
    'imagemin',
    'compile:sass',
    'autoprefix:css',
    'concatenate:css',
    'babel',
    'concatenate:vendor-js',
    'dev:transfer',
    'build:dev',
    'clean'
  )
);

gulp.task('serve-dev', gulp.series('dev', 'connect-dev', 'open-dev', 'watch'));

// build production
gulp.task('build:prod', function () {
  const target = gulp.src('app/src/index.html');
  const sources = gulp.src(['temp/img/**/*', 'temp/js/**/*', 'temp/css/**/*'], {
    read: false
  });

  return target.pipe(inject(sources)).pipe(gulp.dest('app/build/prod'));
});

// build production runner
gulp.task(
  'prod',
  gulp.series(
    'imagemin',
    'compile:sass',
    'autoprefix:css',
    'concatenate:css',
    'babel',
    'concatenate:vendor-js',
    'minify',
    'prod:transfer',
    'build:prod',
    'clean'
  )
);

gulp.task('serve-prod', gulp.series('prod', 'connect-prod', 'open-prod'));
