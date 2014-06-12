var gulp = require('gulp'),
    concat = require('gulp-concat'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    gzip = require("gulp-gzip"),
    csscomb = require('gulp-csscomb'),
    less = require('gulp-less'),
    templateCache = require('gulp-angular-templatecache'),
    cleanhtml = require('gulp-cleanhtml');

gulp.task('templates-ang', function () {

    gulp.src([
        'templates/**/*.html',
        'js/angular/**/*.html',
        //'!templates/components/hotel.html',
        //'!templates/components/ticket.html'
    ])
        .pipe(cleanhtml())
        .pipe(templateCache({
            module: 'innaApp.templates'
        }))
        .pipe(uglify({
            mangle : false,
            output: {
                beautify: true
            }
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('styles', function () {

    var optStyl = {
        use: ['nib'],
        import: ['nib']
    };

    gulp.src(['styl/common.styl'])
        .pipe(stylus(optStyl))
        .pipe(concat('common.min.css'))
        .pipe(minifyCSS(opts))
        .pipe(gulp.dest('css'));
    gulp.src(['styl/ie.styl'])
        .pipe(stylus(optStyl))
        .pipe(concat('ie.min.css'))
        .pipe(minifyCSS(opts))
        .pipe(gulp.dest('css'));
    gulp.src(['styl/ticket.styl'])
        .pipe(stylus(optStyl))
        .pipe(concat('ticket.min.css'))
        .pipe(minifyCSS(opts))
        .pipe(gulp.dest('css'));
    gulp.src(['css/main/*.less', 'css/pages/*.less'])
        .pipe(concat('main.css'))
        .pipe(less())
        .pipe(gulp.dest('css'));
});

gulp.task('print', function () {
    gulp.src(['styl/print.styl'])
        .pipe(stylus({
            use: ['nib'],
            import: ['nib']
        }))
        .pipe(concat('print.css'))
        .pipe(gulp.dest('css'));
});

gulp.task('watch', function () {
    var server = livereload();

    gulp.watch('styl/**/*', ['styles']);
    gulp.watch(['templates/**/*.html', 'js/angular/**/*.html'], ['templates-ang']);

    gulp.watch('*.php', function (evt) {
        server.changed(evt.path);
    });
    gulp.watch('*.html', function (evt) {
        server.changed(evt.path);
    });
});
gulp.task('default', ['styles', 'print', 'templates-ang', 'watch']);

module.exports = gulp;