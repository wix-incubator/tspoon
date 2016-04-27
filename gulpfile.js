var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');

gulp.task('publish-docs', function() {
    return gulp.src('./dist/doc/**/*')
        .pipe(ghPages());
});
