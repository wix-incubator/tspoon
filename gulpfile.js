var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');
var markdown = require('gulp-markdown');
var typedoc = require('./doc/js/gulp-typedoc');

gulp.task('publish-docs', function() {
    return gulp.src('./dist/doc/**/*')
        .pipe(ghPages());
});

gulp.task('markdown', function () {
    return gulp.src('./doc/**/*.md')
        .pipe(markdown())
        .pipe(gulp.dest('dist/doc'));
});

gulp.task("typedoc", function() {
    return gulp
        .src(["./src/index.ts"])
        .pipe(typedoc({
            out: "./dist/doc/typedoc",
            name: "tspoon"
        }));
});
