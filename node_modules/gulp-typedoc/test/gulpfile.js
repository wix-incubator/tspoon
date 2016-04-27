// (c) Rogier Schouten <rogier.schouten@gmail.com>
// License: Apache-2.0

var del = require("del");
var gulp = require("gulp");
var gulpTypedoc = require("../index");

gulp.task("default", ["typedoc"]);

gulp.task("clean", function(cb) {  
	del(["out/"], cb);
}); 

gulp.task("typedoc", ["clean"], function() {
	return gulp
		.src(["data/*.ts"])
		.pipe(gulpTypedoc({ 
			version: true,
			module: "commonjs", 
			out: "./out", 
			json: "./out/test.json", 
			name: "gulp-typedoc-test", 
			target: "es5",
			includeDeclarations: true
		}))
		.on("error", trapError) // make exit code non-zero
	;
});

// Workaround: directly calling process.exit() has corner cases where
// the console.log statements are not flushed (namely if stdout is piped
// instead of goes to a terminal).
var exitCode = 0;
process.on("exit", function() {
	if (exitCode != 0) process.exit(exitCode);
});

// Generic error handling function
// This is needed because Gulp always returns exit code 0
// unless an exception is thrown which gives a useless stack trace.
function trapError(e) {
	if (e.plugin && e.message) { 
		// it is a gulp plugin error
		console.log("Error in plugin: " + e.plugin);
		console.log(e.message);
	}
	else {
		// some other error
		gutil.log(e); 
	}	
	exitCode++;
}


