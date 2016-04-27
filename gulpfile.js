var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');
var typedoc = require("gulp-typedoc");
var markdown = require('gulp-markdown');

gulp.task('publish-docs', function() {
    return gulp.src('./dist/doc/**/*')
        .pipe(ghPages());
});

gulp.task('markdown', function () {
    return gulp.src('./doc/**/*')
        .pipe(markdown())
        .pipe(gulp.dest('dist/doc'));
});

gulp.task("typedoc", function() {
    return gulp
        .src(["src/**/*.ts"])
        .pipe(typedoc({

            module: "commonjs",
            target: "es5",
            includeDeclarations: false,

            // Output options (see typedoc docs)
            out: "./dist/doc/typedoc",
            //json: "./dist/doc/typedoc.json",

            // TypeDoc options (see typedoc docs)
            name: "tspoon",
            theme: "minimal",
            ignoreCompilerErrors: true,
            version: true,
        }));
});
