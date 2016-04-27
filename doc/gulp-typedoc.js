var es = require("event-stream");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var typedocModule = require("typedoc");
var _ = require('lodash');

function typedoc(options) {
    var files = [];
    options = options || {};
    options.theme = './doc/typedoc-themes/custom';
    options.module = 'commonjs';
    options.target = "es5";
    options.includeDeclarations = false;
    options.ignoreCompilerErrors = false;
    options.version = true;

    return es.through(function(file) {
        files.push(file.path);
    }, function() {
        // end of stream, start typedoc
        var stream = this;

        if (files.length === 0) {
            stream.emit("error", new PluginError(PLUGIN_NAME, "No input files for TypeDoc."));
            stream.emit("end");
            return;
        } else if (!options.out) {
            stream.emit("error", new PluginError(PLUGIN_NAME, "You must either specify the 'out' option."));
            stream.emit("end");
            return;
        } else {
            // leaving the 'out' or 'version' option in causes typedoc error for some reason
            var out = options.out;
            delete options.out;
            var json = options.json;
            delete options.json;
            var version = options.version;
            delete options.version;

            // reduce console logging
            options.logger = function(message, level, newline) {
                if (level === 3) {
                    gutil.log(gutil.colors.red(message));
                }
            }

            // typedoc instance
            var app = new typedocModule.Application(options);

            if (version) {
                gutil.log(app.toString());
            }
            var src = app.expandInputFiles(files);
            var project = app.convert(src);
            if (project) {
                var index = _.find(project.children, function(child) {
                    return child.name == '"index"';
                });
                index.name = options.name || 'index';
                index.children = [];
                project.children.forEach(function(child) {
                    index.children = index.children.concat(child.children);
                });
                index.children = index.chidren.sort(function(a, b) {
                   return a.kind == b.kind ? 0 : a.kind < b.kind ? 1 : -1;
                });
                project.children = [ index ];
                if (out) app.generateDocs(project, out);
                if (app.logger.hasErrors()) {
                    stream.emit("error", new PluginError(PLUGIN_NAME, "There were errors generating TypeDoc output, see above."));
                    stream.emit("end");
                    return;
                }
            } else {
                stream.emit("error", new PluginError(PLUGIN_NAME, "Failed to generate load TypeDoc project."));
                stream.emit("end");
                return;
            }
            stream.emit("end");
            return;
        }
    });
};

module.exports = typedoc;
