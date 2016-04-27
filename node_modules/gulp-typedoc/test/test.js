#!node

var assert = require("assert");
var child_process = require("child_process");
var fs = require("fs");
var path = require("path");

var winExt = /^win/.test(process.platform)?".cmd":"";
var executable = path.join(__dirname, "..", "node_modules", ".bin", "gulp" + winExt);
var args = ["--gulpfile", path.join(__dirname, "gulpfile.js")];

child = child_process.spawn(path.resolve(executable), args, {
	stdio: "inherit",
	env: process.env
}).on("exit", function(code) {
	assert(code == 0, "gulp returned nonzero exit code");
	assert(fs.existsSync(path.join(__dirname, "out", "index.html")), "output documentation does not exist");
});
