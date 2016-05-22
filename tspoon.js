var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("examples/poc/src", ["require", "exports"], function (require, exports) {
    "use strict";
    var TwoNames = (function () {
        function TwoNames() {
            this.privateName = 'John';
            this.publicName = 'Doe';
        }
        return TwoNames;
    }());
    exports.TwoNames = TwoNames;
});
define("examples/readme/src", ["require", "exports"], function (require, exports) {
    "use strict";
    var TwoNames = (function () {
        function TwoNames() {
            this.privateName = 'John';
            this.publicName = 'Doe';
        }
        return TwoNames;
    }());
    exports.TwoNames = TwoNames;
});
define("src/traverse-ast", ["require", "exports", 'typescript'], function (require, exports, ts) {
    "use strict";
    function descend(node, context) {
        return function visit() {
            var visitors = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                visitors[_i - 0] = arguments[_i];
            }
            visitors.forEach(function (visitor) {
                traverseAst(node, visitor, context);
            });
        };
    }
    function traverseAst(root, visitor, context) {
        function traverse(node) {
            if (visitor.filter(node)) {
                visitor.visit(node, context, descend(node, context));
                return context.halted || ts.forEachChild(node, traverse);
            }
            return ts.forEachChild(node, traverse);
        }
        return traverse(root);
    }
    exports.traverseAst = traverseAst;
});
define("src/lib/binary-search", ["require", "exports"], function (require, exports) {
    "use strict";
    function binarySearch(array, value) {
        var low = 0;
        var high = array.length - 1;
        while (low <= high) {
            var middle = low + ((high - low) >> 1);
            var midValue = array[middle];
            if (midValue === value) {
                return middle;
            }
            else if (midValue > value) {
                high = middle - 1;
            }
            else {
                low = middle + 1;
            }
        }
        return low - 1; // the last middle
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = binarySearch;
});
define("src/mutable-source-code", ["require", "exports", 'typescript', 'source-map', 'magic-string'], function (require, exports, ts, source_map_1, MagicString) {
    "use strict";
    var MappedAction = (function () {
        function MappedAction() {
        }
        return MappedAction;
    }());
    exports.MappedAction = MappedAction;
    var FastAction = (function () {
        function FastAction() {
        }
        return FastAction;
    }());
    exports.FastAction = FastAction;
    var ReplaceAction = (function (_super) {
        __extends(ReplaceAction, _super);
        function ReplaceAction(start, end, str) {
            _super.call(this);
            this.start = start;
            this.end = end;
            this.str = str;
        }
        ReplaceAction.prototype.execute = function (ast, magicString) {
            magicString.overwrite(this.start, this.end, this.str);
            var textSpan = ts.createTextSpanFromBounds(this.start, this.end);
            var textChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
            return ast.update(magicString.toString(), textChangeRange);
        };
        ReplaceAction.prototype.getStart = function () {
            return this.start;
        };
        return ReplaceAction;
    }(MappedAction));
    exports.ReplaceAction = ReplaceAction;
    var InsertAction = (function (_super) {
        __extends(InsertAction, _super);
        function InsertAction(start, str) {
            _super.call(this);
            this.start = start;
            this.str = str;
        }
        InsertAction.prototype.execute = function (ast, magicString) {
            magicString.insert(this.start, this.str);
            var textSpan = ts.createTextSpanFromBounds(this.start, this.start);
            var textChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
            return ast.update(magicString.toString(), textChangeRange);
        };
        InsertAction.prototype.getStart = function () {
            return this.start;
        };
        return InsertAction;
    }(MappedAction));
    exports.InsertAction = InsertAction;
    var FastAppendAction = (function (_super) {
        __extends(FastAppendAction, _super);
        function FastAppendAction(str) {
            _super.call(this);
            this.str = str;
        }
        FastAppendAction.prototype.execute = function (ast) {
            var start = ast.text.length - 1;
            var textSpan = ts.createTextSpanFromBounds(start, start);
            var textChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
            return ast.update(ast.text + this.str, textChangeRange);
        };
        return FastAppendAction;
    }(FastAction));
    exports.FastAppendAction = FastAppendAction;
    var FastRewriteAction = (function (_super) {
        __extends(FastRewriteAction, _super);
        function FastRewriteAction(start, str) {
            _super.call(this);
            this.start = start;
            this.str = str;
        }
        FastRewriteAction.prototype.execute = function (ast) {
            var textSpan = ts.createTextSpanFromBounds(this.start, this.start + this.str.length);
            var textChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
            var newText = ast.text.slice(0, this.start) + this.str + ast.text.slice(this.start + this.str.length);
            return ast.update(newText, textChangeRange);
        };
        return FastRewriteAction;
    }(FastAction));
    exports.FastRewriteAction = FastRewriteAction;
    var compareActions = function (action1, action2) { return (action2.getStart() - action1.getStart()); };
    var MutableSourceCode = (function () {
        function MutableSourceCode(ast) {
            this._ast = ast;
            this.originalText = ast.text;
            this.origLineStarts = ast.getLineStarts();
        }
        Object.defineProperty(MutableSourceCode.prototype, "ast", {
            get: function () {
                return this._ast;
            },
            enumerable: true,
            configurable: true
        });
        MutableSourceCode.prototype.execute = function (actionList) {
            var _this = this;
            var fastActions = actionList.filter(function (action) { return action instanceof FastAction; });
            fastActions.forEach(function (action) {
                _this._ast = action.execute(_this._ast);
            });
            this.magicString = new MagicString(this._ast.text);
            var sortedActions = actionList
                .filter(function (action) { return action instanceof MappedAction; })
                .sort(compareActions);
            sortedActions.forEach(function (action) {
                _this._ast = action.execute(_this._ast, _this.magicString);
            });
        };
        Object.defineProperty(MutableSourceCode.prototype, "sourceMap", {
            get: function () {
                if (!this.magicString) {
                    this.magicString = new MagicString(this._ast.text);
                }
                if (!this._sourceMap) {
                    this._sourceMap = this.magicString.generateMap({ source: this._ast.fileName, hires: true });
                }
                return this._sourceMap;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MutableSourceCode.prototype, "code", {
            get: function () {
                return this._ast.text;
            },
            enumerable: true,
            configurable: true
        });
        MutableSourceCode.prototype.translateMap = function (from) {
            var originalText = this.originalText;
            var intermediateAst = this._ast;
            var mapConsumer = new source_map_1.SourceMapConsumer(this.sourceMap);
            var fromSMC = new source_map_1.SourceMapConsumer(from);
            var resultMap = new source_map_1.SourceMapGenerator();
            resultMap.setSourceContent(intermediateAst.fileName, originalText);
            fromSMC.eachMapping(function (mapping) {
                var originalPosition = mapConsumer.originalPositionFor({
                    line: mapping.originalLine,
                    column: mapping.originalColumn
                });
                if (originalPosition.line != null) {
                    resultMap.addMapping({
                        source: intermediateAst.fileName,
                        name: mapping.name,
                        generated: {
                            line: mapping.generatedLine,
                            column: mapping.generatedColumn
                        },
                        original: originalPosition
                    });
                }
            });
            this._sourceMap = resultMap.toJSON();
            return resultMap.toJSON();
        };
        MutableSourceCode.prototype.translateDiagnostic = function (diag) {
            var sourceMap = this.sourceMap;
            var cosumer = new source_map_1.SourceMapConsumer(sourceMap);
            var start = diag.file.getLineAndCharacterOfPosition(diag.start);
            var startPos = cosumer.originalPositionFor({
                line: start.line + 1,
                column: start.character
            });
            if (startPos.line === null) {
                return diag;
            }
            else {
                return {
                    file: diag.file,
                    start: diag.file.getPositionOfLineAndCharacter(startPos.line - 1, startPos.column),
                    length: diag.length,
                    messageText: diag.messageText,
                    category: diag.category,
                    code: diag.code
                };
            }
        };
        return MutableSourceCode;
    }());
    exports.MutableSourceCode = MutableSourceCode;
});
define("src/visitor", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("src/configuration", ["require", "exports", 'typescript'], function (require, exports, ts) {
    "use strict";
    exports.defaultCompilerOptions = {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.React,
        target: ts.ScriptTarget.ES5,
        experimentalDecorators: true,
        noEmitHelpers: true,
        sourceMap: true,
        preserveConstEnums: true,
        inlineSources: true,
        emitDecoratorMetadata: false
    };
});
define("src/transpiler-context", ["require", "exports", "src/mutable-source-code", "src/mutable-source-code", "src/mutable-source-code", "src/mutable-source-code"], function (require, exports, mutable_source_code_1, mutable_source_code_2, mutable_source_code_3, mutable_source_code_4) {
    "use strict";
    var TranspilerContext = (function () {
        function TranspilerContext(_fileName, langServiceProvider) {
            if (langServiceProvider === void 0) { langServiceProvider = null; }
            this._fileName = _fileName;
            this.langServiceProvider = langServiceProvider;
            this._halted = false;
            this._actions = [];
            this._diags = [];
        }
        TranspilerContext.prototype.isHalted = function () {
            return this._halted;
        };
        TranspilerContext.prototype.insertLine = function (position, str) {
            this.insert(position, str + '\n');
        };
        TranspilerContext.prototype.insert = function (position, str) {
            this._actions.push(new mutable_source_code_4.InsertAction(position, str));
        };
        TranspilerContext.prototype.replace = function (start, end, str) {
            this._actions.push(new mutable_source_code_1.ReplaceAction(start, end, str));
        };
        TranspilerContext.prototype.fastAppend = function (str) {
            this._actions.push(new mutable_source_code_2.FastAppendAction(str));
        };
        TranspilerContext.prototype.fastRewrite = function (start, str) {
            this._actions.push(new mutable_source_code_3.FastRewriteAction(start, str));
        };
        TranspilerContext.prototype.reportDiag = function (node, category, message, halt) {
            var diagnostic = {
                file: node.getSourceFile(),
                start: node.getStart(),
                length: node.getEnd() - node.getStart(),
                messageText: message,
                category: category,
                code: 0
            };
            this._diags.push(diagnostic);
            this._halted = this._halted || halt;
        };
        TranspilerContext.prototype.pushDiag = function (diagnostic) {
            this._diags.push(diagnostic);
        };
        Object.defineProperty(TranspilerContext.prototype, "actions", {
            get: function () {
                return this._actions;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TranspilerContext.prototype, "diags", {
            get: function () {
                return this._diags;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TranspilerContext.prototype, "halted", {
            get: function () {
                return this._halted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TranspilerContext.prototype, "fileName", {
            get: function () {
                return this._fileName;
            },
            enumerable: true,
            configurable: true
        });
        TranspilerContext.prototype.getLanguageService = function () {
            if (this.langServiceProvider) {
                return this.langServiceProvider();
            }
            else {
                return null;
            }
        };
        return TranspilerContext;
    }());
    exports.TranspilerContext = TranspilerContext;
});
define("src/hosts-base", ["require", "exports"], function (require, exports) {
    "use strict";
    var HostBase = (function () {
        function HostBase() {
        }
        // Most likely to be overridded
        HostBase.prototype.fileExists = function (fileName) {
            return false;
        };
        HostBase.prototype.readFile = function (fileName) {
            return null;
        };
        HostBase.prototype.getSourceFile = function (fileName, languageVersion, onError) {
            return null;
        };
        HostBase.prototype.writeFile = function (name, text, writeByteOrderMark) {
        };
        HostBase.prototype.useCaseSensitiveFileNames = function () {
            return false;
        };
        HostBase.prototype.getCanonicalFileName = function (fileName) {
            return fileName;
        };
        HostBase.prototype.getCurrentDirectory = function () {
            return '';
        };
        HostBase.prototype.getNewLine = function () {
            return '\n';
        };
        HostBase.prototype.getDefaultLibFileName = function (options) {
            return 'lib.d.ts';
        };
        HostBase.prototype.getCancellationToken = function () {
            return null;
        };
        return HostBase;
    }());
    exports.HostBase = HostBase;
    var ChainableHost = (function (_super) {
        __extends(ChainableHost, _super);
        function ChainableHost() {
            _super.apply(this, arguments);
            this.source = null;
        }
        ChainableHost.prototype.setSource = function (source) {
            if (this.source === null) {
                this.source = source;
            }
            else {
                throw new Error("A chainable host can be connected to a source only once. It looks like you're trying to include the same instance in multiple chains.");
            }
        };
        ChainableHost.prototype.fileExists = function (fileName) {
            return this.source.fileExists(fileName);
        };
        ChainableHost.prototype.readFile = function (fileName) {
            return this.source.readFile(fileName);
        };
        ChainableHost.prototype.getSourceFile = function (fileName, languageVersion, onError) {
            return this.source.getSourceFile(fileName, languageVersion, onError);
        };
        ChainableHost.prototype.writeFile = function (name, text, writeByteOrderMark) {
            this.source.writeFile(name, text, writeByteOrderMark);
        };
        return ChainableHost;
    }(HostBase));
    exports.ChainableHost = ChainableHost;
    function chainHosts(host0) {
        var chainableHosts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            chainableHosts[_i - 1] = arguments[_i];
        }
        return chainableHosts.reduce(function (acc, chainableHost) {
            chainableHost.setSource(acc);
            return chainableHost;
        }, host0);
    }
    exports.chainHosts = chainHosts;
});
define("src/transformer", ["require", "exports", "src/transpiler-context", "src/traverse-ast", "src/mutable-source-code"], function (require, exports, transpiler_context_1, traverse_ast_1, mutable_source_code_5) {
    "use strict";
    var VisitorBasedTransformer = (function () {
        function VisitorBasedTransformer(visitors, languageServiceProvider) {
            this.visitors = visitors;
            this.languageServiceProvider = languageServiceProvider;
        }
        VisitorBasedTransformer.prototype.transform = function (ast) {
            var context = new transpiler_context_1.TranspilerContext(ast.fileName, this.languageServiceProvider);
            this.visitors.forEach(function (visitor) {
                context.halted || traverse_ast_1.traverseAst(ast, visitor, context);
            });
            if (context.halted) {
                return null;
            }
            else {
                var mutable = new mutable_source_code_5.MutableSourceCode(ast);
                mutable.execute(context.actions);
                return mutable;
            }
        };
        return VisitorBasedTransformer;
    }());
    exports.VisitorBasedTransformer = VisitorBasedTransformer;
});
define("src/hosts", ["require", "exports", 'typescript', "src/hosts-base", "src/configuration"], function (require, exports, ts, hosts_base_1, configuration_1) {
    "use strict";
    function fileExtensionIs(path, extension) {
        var pathLen = path.length;
        var extLen = extension.length;
        return pathLen > extLen && path.substr(pathLen - extLen, extLen) === extension;
    }
    var MultipleFilesHost = (function (_super) {
        __extends(MultipleFilesHost, _super);
        function MultipleFilesHost(_resolutionHosts, _compilerOptions) {
            if (_compilerOptions === void 0) { _compilerOptions = configuration_1.defaultCompilerOptions; }
            _super.call(this);
            this._resolutionHosts = _resolutionHosts;
            this._compilerOptions = _compilerOptions;
            this.syntacticErrors = [];
        }
        MultipleFilesHost.prototype.fileExists = function (fileName) {
            return this._resolutionHosts.some(function (host) { return host.fileExists(fileName); });
        };
        MultipleFilesHost.prototype.readFile = function (fileName) {
            return this._resolutionHosts.reduce(function (acc, host) { return (!acc && host.fileExists(fileName))
                ? host.readFile(fileName)
                : acc; }, null);
        };
        MultipleFilesHost.prototype.getSourceFile = function (fileName) {
            var source = this.readFile(fileName);
            if (source) {
                var ast = ts.createSourceFile(fileName, source, this._compilerOptions.target, true);
                var syntacticErors = this.getParserErrors(ast);
                if (syntacticErors.length > 0) {
                    (_a = this.syntacticErrors).push.apply(_a, syntacticErors);
                    return null;
                }
                else {
                    return ast;
                }
            }
            else {
                return null;
            }
            var _a;
        };
        MultipleFilesHost.prototype.getSyntacticErrors = function () {
            return this.syntacticErrors;
        };
        MultipleFilesHost.prototype.getParserErrors = function (sourceFile) {
            // We're accessing here an internal property. It would be more legit to access it through
            // ts.Program.getSyntacticDiagsnostics(), but we want to bail out ASAP.
            return sourceFile['parseDiagnostics'];
        };
        return MultipleFilesHost;
    }(hosts_base_1.HostBase));
    exports.MultipleFilesHost = MultipleFilesHost;
    var SingleFileHost = (function (_super) {
        __extends(SingleFileHost, _super);
        function SingleFileHost(_ast) {
            _super.call(this);
            this._ast = _ast;
            this._output = '';
            this._map = null;
        }
        Object.defineProperty(SingleFileHost.prototype, "output", {
            get: function () {
                return this._output;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SingleFileHost.prototype, "sourceMap", {
            get: function () {
                return JSON.parse(this._map);
            },
            enumerable: true,
            configurable: true
        });
        SingleFileHost.prototype.fileExists = function (fileName) {
            return fileName === this._ast.fileName;
        };
        SingleFileHost.prototype.readFile = function (fileName) {
            if (fileName === this._ast.fileName) {
                return this._ast.text;
            }
        };
        SingleFileHost.prototype.getSourceFile = function (fileName) {
            if (fileName === this._ast.fileName) {
                return this._ast;
            }
        };
        SingleFileHost.prototype.writeFile = function (name, text, writeByteOrderMark) {
            if (fileExtensionIs(name, 'map')) {
                this._map = text;
            }
            else {
                this._output = text;
            }
        };
        return SingleFileHost;
    }(hosts_base_1.HostBase));
    exports.SingleFileHost = SingleFileHost;
});
define("src/chainable-hosts", ["require", "exports", 'typescript', "src/transformer", "src/hosts-base", "src/configuration"], function (require, exports, ts, transformer_1, hosts_base_2, configuration_2) {
    "use strict";
    var normalizePath = ts['normalizePath'];
    var getDirectoryPath = ts['getDirectoryPath'];
    var combinePaths = ts['combinePaths'];
    var AstCacheHost = (function (_super) {
        __extends(AstCacheHost, _super);
        function AstCacheHost() {
            _super.apply(this, arguments);
            this.cache = {};
        }
        AstCacheHost.prototype.getSourceFile = function (fileName, languageVersion, onError) {
            var cachedAst = this.cache[fileName];
            if (!cachedAst) {
                var ast = this.source.getSourceFile(fileName, languageVersion, onError);
                this.cache[fileName] = ast;
                return ast;
            }
            else {
                return cachedAst;
            }
        };
        return AstCacheHost;
    }(hosts_base_2.ChainableHost));
    exports.AstCacheHost = AstCacheHost;
    var TransformationHost = (function (_super) {
        __extends(TransformationHost, _super);
        function TransformationHost(visitors, languageServiceProvider) {
            if (languageServiceProvider === void 0) { languageServiceProvider = function () { return null; }; }
            _super.call(this);
            this.transformations = {};
            this.transformer = new transformer_1.VisitorBasedTransformer(visitors, languageServiceProvider);
        }
        TransformationHost.prototype.getSourceFile = function (fileName, languageVersion, onError) {
            var ast = _super.prototype.getSourceFile.call(this, fileName, languageVersion, onError);
            if (ast) {
                var transformation = this.transformer.transform(ast);
                this.transformations[ast.fileName] = transformation;
                return transformation.ast;
            }
            else {
                return null;
            }
        };
        TransformationHost.prototype.getSourceMap = function (fileName) {
            var transformation = this.transformations[fileName];
            if (transformation) {
                return transformation.sourceMap;
            }
            else {
                return null;
            }
        };
        TransformationHost.prototype.translateDiagnostic = function (diagnostic) {
            var transformation = this.transformations[diagnostic.file.fileName];
            return transformation ? transformation.translateDiagnostic(diagnostic) : diagnostic;
        };
        return TransformationHost;
    }(hosts_base_2.ChainableHost));
    exports.TransformationHost = TransformationHost;
    var SemanticHost = (function (_super) {
        __extends(SemanticHost, _super);
        function SemanticHost(files, compilerOptions) {
            if (compilerOptions === void 0) { compilerOptions = configuration_2.defaultCompilerOptions; }
            _super.call(this);
            this.files = files;
            this.compilerOptions = compilerOptions;
        }
        SemanticHost.prototype.getProjectVersion = function () {
            return null;
        };
        SemanticHost.prototype.getScriptFileNames = function () {
            return this.files.slice();
        };
        SemanticHost.prototype.getScriptVersion = function (fileName) {
            return null;
        };
        SemanticHost.prototype.getScriptSnapshot = function (fileName) {
            return ts.ScriptSnapshot.fromString(this.readFile(fileName));
        };
        SemanticHost.prototype.getLocalizedDiagnosticMessages = function () {
            return null;
        };
        SemanticHost.prototype.getCompilationSettings = function () {
            return this.compilerOptions;
        };
        SemanticHost.prototype.log = function (s) {
        };
        SemanticHost.prototype.trace = function (s) {
        };
        SemanticHost.prototype.error = function (s) {
        };
        SemanticHost.prototype.resolveModuleNames = function (moduleNames, containingFile) {
            var _this = this;
            var containingDir = getDirectoryPath(containingFile);
            return moduleNames.map(function (moduleName) {
                var resolvedBase = normalizePath(combinePaths(containingDir, moduleName));
                return {
                    resolvedFileName: _this.tryResolveFileName(resolvedBase + '.tsx') || _this.tryResolveFileName(resolvedBase + '.ts'),
                    isExternalLibraryImport: false
                };
            });
        };
        SemanticHost.prototype.tryResolveFileName = function (candidate) {
            return this.source.fileExists(candidate) ? candidate : null;
        };
        SemanticHost.prototype.directoryExists = function (directoryName) {
            return null;
        };
        SemanticHost.prototype.acquireDocument = function (fileName, compilationSettings, scriptSnapshot, version) {
            return this.source.getSourceFile(fileName, compilationSettings.target);
        };
        /**
         * Request an updated version of an already existing SourceFile with a given fileName
         * and compilationSettings. The update will in-turn call updateLanguageServiceSourceFile
         * to get an updated SourceFile.
         *
         * @param fileName The name of the file requested
         * @param compilationSettings Some compilation settings like target affects the
         * shape of a the resulting SourceFile. This allows the DocumentRegistry to store
         * multiple copies of the same file for different compilation settings.
         * @param scriptSnapshot Text of the file.
         * @param version Current version of the file.
         */
        SemanticHost.prototype.updateDocument = function (fileName, compilationSettings, scriptSnapshot, version) {
            return this.source.getSourceFile(fileName, compilationSettings.target);
        };
        /**
         * Informs the DocumentRegistry that a file is not needed any longer.
         *
         * Note: It is not allowed to call release on a SourceFile that was not acquired from
         * this registry originally.
         *
         * @param fileName The name of the file to be released
         * @param compilationSettings The compilation settings used to acquire the file
         */
        SemanticHost.prototype.releaseDocument = function (fileName, compilationSettings) {
        };
        SemanticHost.prototype.reportStats = function () {
            return '';
        };
        return SemanticHost;
    }(hosts_base_2.ChainableHost));
    exports.SemanticHost = SemanticHost;
});
define("src/apply-visitor", ["require", "exports", 'typescript', "src/configuration", "src/traverse-ast", "src/mutable-source-code", "src/transpiler-context", "src/chainable-hosts", "src/transformer"], function (require, exports, ts, configuration_3, traverse_ast_2, mutable_source_code_6, transpiler_context_2, chainable_hosts_1, transformer_2) {
    "use strict";
    function applyVisitor(source, visitor) {
        var ast = ts.createSourceFile('test.ts', source, configuration_3.defaultCompilerOptions.target, true);
        return applyVisitorOnAst(ast, visitor);
    }
    exports.applyVisitor = applyVisitor;
    function applyVisitorOnHostedSource(file, visitors, host) {
        var langService = host instanceof chainable_hosts_1.SemanticHost ? ts.createLanguageService(host, host) : null;
        var transformer = new transformer_2.VisitorBasedTransformer(visitors, function () { return langService; });
        var ast = host.getSourceFile(file, configuration_3.defaultCompilerOptions.target);
        if (ast) {
            var mutableSourceCode = transformer.transform(ast);
            return mutableSourceCode.code;
        }
        else {
            return null;
        }
    }
    exports.applyVisitorOnHostedSource = applyVisitorOnHostedSource;
    function applyVisitorOnAst(ast, visitor) {
        var context = new transpiler_context_2.TranspilerContext(ast.fileName);
        traverse_ast_2.traverseAst(ast, visitor, context);
        var mapper = new mutable_source_code_6.MutableSourceCode(ast);
        mapper.execute(context.actions);
        return {
            code: mapper.code,
            actions: context.actions,
            diags: context.diags,
            file: ast.getSourceFile()
        };
    }
    exports.applyVisitorOnAst = applyVisitorOnAst;
});
define("src/transpile", ["require", "exports", 'typescript', "src/hosts", "src/traverse-ast", "src/mutable-source-code", "src/transpiler-context", "src/configuration", "src/chainable-hosts", "src/chainable-hosts", "src/hosts-base", "src/chainable-hosts"], function (require, exports, ts, hosts_1, traverse_ast_3, mutable_source_code_7, transpiler_context_3, configuration_4, chainable_hosts_2, chainable_hosts_3, hosts_base_3, chainable_hosts_4) {
    "use strict";
    function getParserErrors(sourceFile) {
        // We're accessing here an internal property. It would be more legit to access it through
        // ts.Program.getSyntacticDiagsnostics(), but we want to bail out ASAP.
        return sourceFile['parseDiagnostics'];
    }
    function transpile(content, config) {
        // The context may contain compiler options and a list of visitors.
        // If it doesn't, we use the default as defined in ./configuration.ts
        var compilerOptions = config.compilerOptions || configuration_4.defaultCompilerOptions;
        // First we initialize a SourceFile object with the given source code
        var fileName = config.sourceFileName;
        // Then we let TypeScript parse it into an AST
        var ast = ts.createSourceFile(fileName, content, compilerOptions.target, true);
        var parserErrors = getParserErrors(ast);
        if (parserErrors.length > 0) {
            return {
                code: null,
                diags: parserErrors,
                halted: true,
                sourceMap: null
            };
        }
        // The context contains code modifications and diagnostics
        var context = new transpiler_context_3.TranspilerContext(ast.fileName);
        // We execute the various visitors, each traversing the AST and generating
        // lines to be pushed into the code and diagbostic messages.
        // If one of the visitors halts the transilation process we return the halted object.
        config.visitors.some(function (visitor) {
            traverse_ast_3.traverseAst(ast, visitor, context);
            return context.halted;
        });
        if (context.halted) {
            return {
                code: null,
                sourceMap: null,
                diags: context.diags,
                halted: true
            };
        }
        // Now, we mutate the code with the resulting list of strings to be pushed
        var mutable = new mutable_source_code_7.MutableSourceCode(ast);
        mutable.execute(context.actions);
        // This intermediate code has to be transpiled by TypeScript
        var compilerHost = new hosts_1.SingleFileHost(mutable.ast);
        var program = ts.createProgram([fileName], compilerOptions, compilerHost);
        var emitResult = program.emit();
        emitResult.diagnostics.forEach(function (d) {
            context.pushDiag(mutable.translateDiagnostic(d));
        });
        // If TypeScript did not complete the transpilation, we return the halted object
        if (emitResult.emitSkipped) {
            return {
                code: null,
                sourceMap: null,
                diags: context.diags,
                halted: true
            };
        }
        // If we got here, it means we have final source code to return
        var finalCode = compilerHost.output;
        var intermediateSourceMap = compilerHost.sourceMap;
        // The resulting sourcemap maps the final code to the intermediate code,
        // but we want a sourcemap that maps the final code to the original code,
        // so...
        var finalSourceMap = intermediateSourceMap ? mutable.translateMap(intermediateSourceMap) : null;
        // Now we return the final code and the final sourcemap
        return {
            code: finalCode,
            sourceMap: finalSourceMap,
            diags: context.diags,
            halted: false
        };
    }
    exports.transpile = transpile;
    function validateAll(files, config) {
        var langService;
        var sourceHost = new hosts_1.MultipleFilesHost(config.resolutionHosts, configuration_4.defaultCompilerOptions);
        var astCache = new chainable_hosts_4.AstCacheHost();
        var cachedSource = hosts_base_3.chainHosts(sourceHost, astCache);
        var semanticHost = hosts_base_3.chainHosts(cachedSource, new chainable_hosts_2.SemanticHost(files, configuration_4.defaultCompilerOptions));
        var langServiceProvider = function () { return langService
            ? langService
            : langService = ts.createLanguageService(semanticHost, semanticHost); };
        var transformHost = new chainable_hosts_3.TransformationHost(config.mutators || [], langServiceProvider);
        var program = ts.createProgram(files, configuration_4.defaultCompilerOptions, hosts_base_3.chainHosts(cachedSource, transformHost));
        var diags = [].concat(sourceHost.getSyntacticErrors(), program.getSemanticDiagnostics());
        return diags.map(function (diagnostic) { return transformHost.translateDiagnostic(diagnostic); });
    }
    exports.validateAll = validateAll;
});
define("src/index", ["require", "exports", "src/transpile", "src/apply-visitor", "src/hosts", "src/traverse-ast"], function (require, exports, transpile_1, apply_visitor_1, hosts_2, traverse_ast_4) {
    "use strict";
    exports.transpile = transpile_1.transpile;
    exports.validateAll = transpile_1.validateAll;
    exports.applyVisitor = apply_visitor_1.applyVisitor;
    exports.applyVisitorOnAst = apply_visitor_1.applyVisitorOnAst;
    exports.applyVisitorOnHostedSource = apply_visitor_1.applyVisitorOnHostedSource;
    exports.MultipleFilesHost = hosts_2.MultipleFilesHost;
    exports.traverseAst = traverse_ast_4.traverseAst;
});
define("test-kit/diagnostics-utils", ["require", "exports"], function (require, exports) {
    "use strict";
    function printMessage(messageText) {
        if (messageText['messageText']) {
            return printMessage(messageText.messageText);
        }
        else {
            return messageText.toString();
        }
    }
    function printDiagnostic(diagnostic) {
        var linePos = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        var message = printMessage(diagnostic.messageText);
        return diagnostic.file.fileName + " -> " + (linePos.line + 1) + ":" + linePos.character + " " + message;
    }
    exports.printDiagnostic = printDiagnostic;
});
define("test-kit/matchers/typecheck", ["require", "exports", 'chai', "test-kit/diagnostics-utils"], function (require, exports, chai_1, diagnostics_utils_1) {
    "use strict";
    var TypecheckFailure = (function () {
        function TypecheckFailure(assertion, diags) {
            this.assertion = assertion;
            this.diags = diags;
        }
        Object.defineProperty(TypecheckFailure.prototype, "and", {
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });
        TypecheckFailure.prototype.withMessage = function (messageMatch) {
            var isMatch;
            if (messageMatch instanceof RegExp) {
                isMatch = this.diags.some(function (diag) {
                    var messageText = diagnostics_utils_1.printDiagnostic(diag);
                    return !!(messageText.match(messageMatch));
                });
            }
            else if (typeof messageMatch === 'string') {
                isMatch = this.diags.some(function (diag) { return !!(diag.messageText && diag.messageText === messageMatch); });
            }
            chai_1.expect(isMatch).to.equal(true, "Expected some of the typechecker messages to match " + messageMatch + ".\nActual errors:\n" + printErrors(this.diags) + "\n");
            return this;
        };
        TypecheckFailure.prototype.withMessageCount = function (expectedCount) {
            chai_1.expect(this.diags.length)
                .to.equal(expectedCount, "Expected to fail with " + expectedCount + " errors, but got " + this.diags.length + ".\nActual errors:\n" + printErrors(this.diags) + "\n");
            return this;
        };
        return TypecheckFailure;
    }());
    function printErrors(diags) {
        return diags.map(diagnostics_utils_1.printDiagnostic).join('\n');
    }
    function default_1(chai, util) {
        chai.Assertion.addMethod('pass', function () {
            chai_1.expect(this._obj).to.be.an('Array');
            this.empty;
        });
        chai.Assertion.addMethod('fail', function () {
            chai_1.expect(this._obj).to.be.an('Array');
            this.not.empty;
            var diags = this._obj;
            return new TypecheckFailure(this, diags);
        });
        chai.Assertion.addMethod('pass', function () {
            this.an('Array');
            this.assert(this._obj.length === 0, "Expected to get 0 validation errors, but got, but got " + this._obj.length + ":\n\t\t\t\t" + printErrors(this._obj) + "\n\t\t\t", 'Expected to get validation errors, but got, but got none.');
        });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
});
define("test-kit/code-positions", ["require", "exports", 'lodash'], function (require, exports, _) {
    "use strict";
    function findCodePosition(code, snippet) {
        var lines = code.split(/[\r\n]/);
        var lineNo = _.findIndex(lines, function (line) { return _.includes(line, snippet); });
        if (lineNo > -1) {
            var column = (lineNo > -1) && lines[lineNo].indexOf(snippet);
            return {
                line: lineNo + 1,
                column: column
            };
        }
        else {
            return null;
        }
    }
    exports.findCodePosition = findCodePosition;
    function findCodeRange(code, snippet) {
        var pos = code.indexOf(snippet);
        return pos < 0 ? null : { pos: pos, end: pos + snippet.length };
    }
    exports.findCodeRange = findCodeRange;
});
define("test-kit/mocks/module-loaders", ["require", "exports"], function (require, exports) {
    "use strict";
    function getModuleLoader() {
        return new CommonJSMockLoader();
    }
    exports.getModuleLoader = getModuleLoader;
    // typescript-generated functions
    function __decorate(decorators, target, key, desc) {
        switch (arguments.length) {
            case 2: return decorators.reduceRight(function (o, d) { return (d && d(o)) || o; }, target);
            case 3: return decorators.reduceRight(function (o, d) { return (d && d(target, key)), void 0; }, void 0);
            case 4: return decorators.reduceRight(function (o, d) { return (d && d(target, key, o)) || o; }, desc);
        }
    }
    function __extends(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    // ... end of ts generated stuff
    var CommonJSMockLoader = (function () {
        function CommonJSMockLoader() {
            this._dependencies = {};
        }
        CommonJSMockLoader.prototype.addDependency = function (_a) {
            var depName = _a.depName, exportName = _a.exportName, value = _a.value;
            this._dependencies[depName] = this._dependencies[depName] || {};
            if (exportName === 'default') {
                this._dependencies[depName] = value;
            }
            this._dependencies[depName][exportName] = value;
        };
        CommonJSMockLoader.prototype.load = function (source) {
            var _this = this;
            var Module = {
                exports: {}
            };
            var testFn = new Function("\n            return function loadModuleCjs(require, exports, module, __decorate, __extends) {\n                " + source + "\n            }\n        ");
            testFn()(function (moduleName) { return _this._dependencies[moduleName]; }, Module.exports, Module, __decorate, __extends);
            return Module.exports;
        };
        return CommonJSMockLoader;
    }());
});
define("test-kit/evaluate-module", ["require", "exports", "test-kit/mocks/module-loaders"], function (require, exports, module_loaders_1) {
    "use strict";
    function evaluateModuleExports(source, dependencies) {
        if (dependencies === void 0) { dependencies = []; }
        var moduleLoader = module_loaders_1.getModuleLoader();
        dependencies.forEach(function (d) {
            moduleLoader.addDependency(d);
        });
        return moduleLoader.load(source);
    }
    exports.evaluateModuleExports = evaluateModuleExports;
});
define("test-kit/index", ["require", "exports", 'chai', "test-kit/matchers/typecheck", "test-kit/code-positions", "test-kit/evaluate-module"], function (require, exports, chai, typecheck_1, code_positions_1, evaluate_module_1) {
    "use strict";
    chai.use(typecheck_1.default);
    exports.findCodePosition = code_positions_1.findCodePosition;
    exports.findCodeRange = code_positions_1.findCodeRange;
    exports.evaluateModuleExports = evaluate_module_1.evaluateModuleExports;
    // This is a loader for debugging purposes when running node tests (not from webpack bundle)
    if (require.extensions) {
        require.extensions['.ts'] = function (module, fileName) {
            var content = require('fs').readFileSync(fileName).toString();
            var code = 'module.exports = ' + JSON.stringify(content) + ';';
            return module._compile(code, fileName);
        };
    }
});
define("test/e2e.example-poc.spec", ["require", "exports", 'chai', "src/index", "test-kit/index"], function (require, exports, chai_2, tspoon, index_1) {
    "use strict";
    var visitor = require('../../examples/poc/deletePrivate.js');
    describe('poc example', function () {
        var sourceCode, configNoVisitors, configWithVisitors;
        before(function () {
            sourceCode = require('../../examples/poc/src.ts'); // the path is relative to tspoon/dist/test
            configNoVisitors = {
                sourceFileName: 'src.ts',
                visitors: []
            };
            configWithVisitors = {
                sourceFileName: 'src.ts',
                visitors: [visitor]
            };
        });
        it('is transpiled', function () {
            var transpilerOut = tspoon.transpile(sourceCode, configWithVisitors);
            chai_2.expect(transpilerOut.halted).not.to.be.ok;
            chai_2.expect(transpilerOut.code).to.be.ok;
            chai_2.expect(transpilerOut.sourceMap).to.be.ok;
        });
        it('is transpiled correctly without visitors', function () {
            var transpilerOut = tspoon.transpile(sourceCode, configNoVisitors);
            var TwoNames = index_1.evaluateModuleExports(transpilerOut.code)['TwoNames'];
            var instance = new TwoNames();
            chai_2.expect(transpilerOut.diags).to.be.empty;
            chai_2.expect(transpilerOut.halted).not.to.be.ok;
            chai_2.expect(instance.publicName, 'publicName').to.eql('Doe');
            chai_2.expect(instance.privateName, 'privateName').to.eql('John');
        });
        it('is transpiled correctly with visitors and removes fields with no explicit visibility', function () {
            var transpilerOut = tspoon.transpile(sourceCode, configWithVisitors);
            var TwoNames = index_1.evaluateModuleExports(transpilerOut.code)['TwoNames'];
            var instance = new TwoNames();
            chai_2.expect(instance.publicName, 'publicName').to.eql('Doe');
            chai_2.expect(instance.privateName, 'privateName').not.to.be.ok;
        });
    });
});
define("test/e2e.example-readme.spec", ["require", "exports", 'chai', "src/index", "test-kit/index"], function (require, exports, chai_3, tspoon, index_2) {
    "use strict";
    var visitor = require('../../examples/readme/alertProperty.js');
    describe('readme example', function () {
        var sourceCode, config;
        before(function () {
            sourceCode = require('../../examples/readme/src.ts'); // the path is relative to tspoon/dist/test
            config = {
                sourceFileName: 'src.ts',
                visitors: [visitor]
            };
        });
        it('is transpiled', function () {
            var transpilerOut = tspoon.transpile(sourceCode, config);
            chai_3.expect(transpilerOut.halted).not.to.be.ok;
            chai_3.expect(transpilerOut.code).to.be.ok;
            chai_3.expect(transpilerOut.sourceMap).to.be.ok;
        });
        it('is transpiled correctly with visitors', function () {
            var transpilerOut = tspoon.transpile(sourceCode, config);
            var TwoNames = index_2.evaluateModuleExports(transpilerOut.code)['TwoNames'];
            var instance = new TwoNames();
            chai_3.expect(transpilerOut.halted).not.to.be.ok;
            chai_3.expect(instance.publicName, 'publicName').to.eql('Doe');
            chai_3.expect(instance.privateName, 'privateName').to.eql('John');
        });
        it('is transpiled with two diagnostics', function () {
            chai_3.expect(tspoon.transpile(sourceCode, config).diags.length).to.eql(2);
        });
    });
});
define("test-kit/mocks/resolution-hosts", ["require", "exports"], function (require, exports) {
    "use strict";
    var MockModule = (function () {
        function MockModule(mockFileName, mockContent) {
            this.mockFileName = mockFileName;
            this.mockContent = mockContent;
        }
        MockModule.prototype.fileExists = function (fileName) {
            return this.mockFileName === fileName;
        };
        MockModule.prototype.readFile = function (fileName) {
            return this.mockFileName === fileName ? this.mockContent : null;
        };
        return MockModule;
    }());
    exports.MockModule = MockModule;
});
define("test/e2e.validate-all.spec", ["require", "exports", 'chai', 'typescript', "src/index", "test-kit/mocks/resolution-hosts"], function (require, exports, chai_4, ts, tspoon, resolution_hosts_1) {
    "use strict";
    function beforeVariable(varName) {
        return {
            insert: function (code) {
                return {
                    filter: function (node) {
                        if (node.kind === ts.SyntaxKind.VariableDeclarationList) {
                            var declList = node;
                            return declList.declarations.some(function (decl) { return decl.name.getText() === varName; });
                        }
                        return false;
                    },
                    visit: function (node, context) {
                        context.insertLine(node.pos, code);
                    }
                };
            }
        };
    }
    describe('tspoon.validateAll()', function () {
        it('lets valid code pass', function () {
            var config = {
                resolutionHosts: [
                    new resolution_hosts_1.MockModule('index.ts', 'export const perfectlyValid: number = 666;'),
                    new resolution_hosts_1.MockModule('index2.ts', 'export const perfectlyValid2: number = 777;')
                ]
            };
            chai_4.expect(tspoon.validateAll(['index.ts', 'index2.ts'], config)).to.pass();
        });
        it('makes invalid code fail', function () {
            var config = {
                resolutionHosts: [
                    new resolution_hosts_1.MockModule('index.ts', 'export const perfectlyValid: number = 666;'),
                    new resolution_hosts_1.MockModule('index2.ts', "// This comment here\n\t\t\t\t\t// is just\n\t\t\t\t\t// to add some lines\n\t\t\t\t\texport const perfectlyValid: number = 666;\n\t\t\t\t\texport const perfectlyInvalid: SomeUndefinedType = 'HAHAHA';\n\t\t\t\t")
                ]
            };
            chai_4.expect(tspoon.validateAll(['index.ts', 'index2.ts'], config)).to.fail()
                .withMessageCount(1)
                .withMessage(/index2.ts -> 5:\d+ Cannot find name 'SomeUndefinedType'./);
        });
        it('lets invalid code that was fixed by a visitor pass', function () {
            var config = {
                resolutionHosts: [
                    new resolution_hosts_1.MockModule('index.ts', "\n\t\t\t\t\t// This comment here\n\t\t\t\t\t// is just\n\t\t\t\t\t// to add some lines\n\t\t\t\t\tconst perfectlyValid: number = 666;\n\t\t\t\t\tconst perfectlyInvalid: SomeUndefinedType = 'HAHAHA';\n\t\t\t\t")
                ],
                mutators: [
                    beforeVariable('perfectlyInvalid').insert('\ntype SomeUndefinedType = string;')
                ]
            };
            chai_4.expect(tspoon.validateAll(['index.ts'], config)).to.pass();
        });
        it('preserves error lines despite the modifications', function () {
            var config = {
                resolutionHosts: [
                    new resolution_hosts_1.MockModule('index.ts', " \t\t\t\t\t\t\t\t\t// line 1\n\t\t\t\t\t// This comment here     \t\t\t\t\t\t\t\t\t// line 2\n\t\t\t\t\t// is just     \t\t\t\t\t\t\t\t\t            // line 3\n\t\t\t\t\t// to add some lines     \t\t\t\t\t\t\t\t\t// line 4\n\t\t\t\t\tconst perfectlyValid: number = 666;     \t\t\t\t\t// line 5\n\t\t\t\t\tconst perfectlyInvalid: SomeUndefinedType = 'HAHAHA';     \t// line 6\n\t\t\t\t")
                ],
                mutators: [
                    beforeVariable('perfectlyInvalid').insert('\nconst anotherValidLine: number = 777;')
                ]
            };
            chai_4.expect(tspoon.validateAll(['index.ts'], config)).to.fail()
                .withMessageCount(1)
                .withMessage(/.* -> 6:\d+ Cannot find name 'SomeUndefinedType'./);
        });
        it('modifies a dependency of the validated file', function () {
            var config = {
                resolutionHosts: [
                    new resolution_hosts_1.MockModule('index.ts', "\n\t\t\t\t\timport Product from './Product';\n\t\t\t\t\tconst product: Product = { title: 'Sample' };\n\t\t\t\t"),
                    new resolution_hosts_1.MockModule('Product.ts', "\n\t\t\t\t\tinterface Product { title: string; }\n\t\t\t\t\tconst somethingUnrelated: string = 'what?';\n\t\t\t\t")
                ],
                mutators: [
                    beforeVariable('somethingUnrelated').insert('export default Product;')
                ]
            };
            chai_4.expect(tspoon.validateAll(['index.ts'], config)).to.pass();
        });
        it('fails gracefully with syntactically incorrect input', function () {
            var config = {
                resolutionHosts: [
                    new resolution_hosts_1.MockModule('index.ts', "\n\t\t\t\t\timport {Product} from './Product';\n\t\t\t\t\tconst product: Product = { title: 'Sample'\n\t\t\t\t"),
                    new resolution_hosts_1.MockModule('Product.ts', "\n\t\t\t\t\texport class Product { title: string; }\n\t\t\t\t\tconst somethingUnrelated: string = 'what?';\n\t\t\t\t")
                ]
            };
            chai_4.expect(tspoon.validateAll(['index.ts'], config)).to.fail()
                .withMessage(/index.ts -> \d+:\d+ '}' expected./);
        });
        it('fails gracefully with syntactically incorrect dependency', function () {
            var config = {
                resolutionHosts: [
                    new resolution_hosts_1.MockModule('index.ts', "\n\t\t\t\t\timport {Product} from './Product';\n\t\t\t\t\tconst product: Product = { title: 'Sample' }\n\t\t\t\t"),
                    new resolution_hosts_1.MockModule('Product.ts', "\n\t\t\t\t\texport class Product { title: string; }\n\t\t\t\t\tconst somethingUnrelated: string = 'what?\n\t\t\t\t")
                ]
            };
            chai_4.expect(tspoon.validateAll(['index.ts'], config)).to.fail()
                .withMessage(/Product.ts -> \d+:\d+ Unterminated string literal./);
        });
        it('can access semantic information', function () {
            this.timeout(10000);
            var MockVisitor = (function () {
                function MockVisitor() {
                }
                MockVisitor.prototype.filter = function (node) {
                    return node.getSourceFile().fileName === 'index.ts' && node.kind === ts.SyntaxKind.VariableDeclaration;
                };
                MockVisitor.prototype.visit = function (node, context) {
                    var ls = context.getLanguageService();
                    var x = ls.getTypeDefinitionAtPosition(node.getSourceFile().fileName, node.getStart());
                    this.realTypeName = x[0].name;
                };
                return MockVisitor;
            }());
            var visitor = new MockVisitor();
            var config = {
                resolutionHosts: [
                    new resolution_hosts_1.MockModule('a.ts', "\n\t\t\t\t\texport default class Product {}\n\t\t\t\t"),
                    new resolution_hosts_1.MockModule('index.ts', "\n\t\t\t\t\timport {default as SomeClass} from './a';\n\t\t\t\t\tconst a: SomeClass = null;\n\t\t\t\t"),
                    new resolution_hosts_1.MockModule('lib.d.ts', require('typescript/lib/lib.d.ts'))
                ],
                mutators: [
                    visitor
                ]
            };
            tspoon.validateAll(['index.ts'], config);
            chai_4.expect(visitor.realTypeName).to.equal('Product');
        });
    });
});
define("test/mutable-source-code.spec", ["require", "exports", 'chai', 'typescript', "src/mutable-source-code", "test-kit/index", "src/hosts", "src/configuration", 'source-map'], function (require, exports, chai_5, ts, mutable_source_code_8, index_3, hosts_3, configuration_5, source_map_2) {
    "use strict";
    function makeReplacement(source, atStr, insStr) {
        var textRange = index_3.findCodeRange(source, atStr);
        return new mutable_source_code_8.ReplaceAction(textRange.pos, textRange.end, insStr);
    }
    function makeLineInsersion(source, atStr, insStr) {
        var textRange = index_3.findCodeRange(source, atStr);
        return new mutable_source_code_8.ReplaceAction(textRange.pos, textRange.pos, insStr + '\n');
    }
    function aSourceMapperFor(source) {
        var ast = ts.createSourceFile('test.ts', source, configuration_5.defaultCompilerOptions.target, true);
        return new mutable_source_code_8.MutableSourceCode(ast);
    }
    function expectSourceMapToMatchChangeForSuppliedText(source, target, sourceMap, text) {
        var positionBeforeChange = index_3.findCodePosition(source, text);
        var positionAfterChange = index_3.findCodePosition(target, text);
        var mapConsumer = new source_map_2.SourceMapConsumer(sourceMap);
        var mappedPosition = mapConsumer.originalPositionFor(positionAfterChange);
        chai_5.expect({ line: mappedPosition.line, column: mappedPosition.column })
            .to.eql({ line: positionBeforeChange.line, column: positionBeforeChange.column });
    }
    function transpile(source) {
        var ast = ts.createSourceFile('test.ts', source, configuration_5.defaultCompilerOptions.target, true);
        var compilerHost = new hosts_3.SingleFileHost(ast);
        var program = ts.createProgram(['test.ts'], configuration_5.defaultCompilerOptions, compilerHost);
        program.emit();
        return {
            code: compilerHost.output,
            map: compilerHost.sourceMap
        };
    }
    describe('given a source code and given a replacement command, sourcemapper should', function () {
        var source = "class A {}\nPLACE_HOLDERclass B {}\nfubar();";
        var target = "class A {}\n@bar\n@foo\nclass B {}\nfubar();";
        var action1 = makeLineInsersion(source, 'PLACE_HOLDER', '@bar');
        var action2 = makeReplacement(source, 'PLACE_HOLDER', '@foo\n');
        // adding action3 demonstrates problems with making changes based on a text after that text has been replaced (see action2).
        // using the next versin of magic-string may solve this
        // const action3 = makeLineInsersion(source, 'PLACE_HOLDER', '\n@baz');
        // mutableCode.execute([action1, action2 /*, action3*/]);
        var mutableCode;
        beforeEach(function () {
            mutableCode = aSourceMapperFor(source);
        });
        it('generate a new string that matches the expected target', function () {
            mutableCode.execute([action1, action2 /*, action3*/]);
            chai_5.expect(mutableCode.code).to.equal(target);
        });
        it('generate correct sourcemap that reflects the changes', function () {
            mutableCode.execute([action1, action2 /*, action3*/]);
            expectSourceMapToMatchChangeForSuppliedText(source, mutableCode.code, mutableCode.sourceMap, 'class B');
        });
        it('map the changes onto a sourcemap generated by typescript', function () {
            mutableCode.execute([action1, action2 /*, action3*/]);
            var result = transpile(mutableCode.code);
            var sourceMap = mutableCode.translateMap(result.map);
            expectSourceMapToMatchChangeForSuppliedText(source, result.code, sourceMap, 'fubar()');
        });
    });
});
define("test/transpile.spec", ["require", "exports", 'chai', 'typescript', 'lodash', '../src'], function (require, exports, chai_6, typescript_1, _, src_1) {
    "use strict";
    var config = {
        sourceFileName: 'sample.tsx',
        visitors: []
    };
    describe('transpiler', function () {
        it('fails on parser errors', function () {
            var source = 'let a = <div><div></div>;';
            var transpiled = src_1.transpile(source, config);
            chai_6.expect(transpiled.code).not.to.be.ok;
            chai_6.expect(transpiled.diags).not.to.be.empty;
        });
        describe('e2e regression test', function () {
            var config2 = {
                compilerOptions: {
                    inlineSourceMap: false,
                    sourceMap: true,
                    inlineSources: false,
                    noEmitHelpers: false
                },
                sourceFileName: 'sample.tsx',
                visitors: [{
                        filter: function (node) {
                            return node.kind == typescript_1.SyntaxKind.ClassDeclaration && node.decorators && node.decorators.length > 0;
                        },
                        visit: function (node, context) {
                            var targetPosition = node.pos;
                            var classNode = node;
                            if (!_.isEmpty(classNode.decorators)) {
                                targetPosition = _.last(classNode.decorators).end + 1;
                            }
                            //		console.log('targetPosition', targetPosition);
                            context.insertLine(targetPosition, "@fooo(`------------------------\n\t\t\t\t\t'tags': ['@type'],\n\t\t\t\t\t'properties': [\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t'name': 'title',\n\t\t\t\t\t\t\t'type': 'core3.types.String'\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t'name': 'price',\n\t\t\t\t\t\t\t'type': 'core3.types.Number'\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t'name': 'flag',\n\t\t\t\t\t\t\t'type': 'core3.types.Boolean'\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t'name': 'func',\n\t\t\t\t\t\t\t'type': 'core3.types.Function'\n\t\t\t\t\t\t}\n\t\t\t\t\t],\n\t\t\t\t\t'methods': []\n\t\t\t\t`)");
                        }
                    }]
            };
            it('checks sample code doesn\'t get garbled up the same way it once did', function () {
                var source = "\n/// <reference path='../../../typings/tsd.d.ts'/>\n\nfunction bar(){\n}\nvar foo = bar;\nvar fooo = bar;\n\n@bar\nclass ImageType {\n}\n\n@bar\nclass ImageProps {\n}\n\n@bar\nclass ImageState  {\n}\n\nexport class CropUtils{\n\tstatic getContainLayout(imageWidth:number, imageHeight:number, boxWidth:number, boxHeight:number): Layout {\n\t\tvar layout:Layout = { x:0, y:0 };\n\t\tvar imageRatio = imageWidth / imageHeight;\n\t\tvar boxRatio = boxWidth / boxHeight;\n\t\tif(imageRatio < boxRatio){\n\t\t\tlayout.w = boxHeight * imageRatio;\n\t\t\tlayout.h = boxHeight;\n\t\t\tlayout.x = Math.round(boxWidth/2 - layout.w/2);\n\t\t} else {\n\t\t\tlayout.w = boxWidth;\n\t\t\tlayout.h = boxWidth / imageRatio;\n\t\t\tlayout.y = Math.round(boxHeight/2 - layout.h/2);\n\t\t}\n\t\treturn layout;\n\t}\n\n\tstatic getCoverLayout(imageWidth:number, imageHeight:number, boxWidth:number, boxHeight:number): Layout {\n\t\tvar layout:Layout = { x:0, y:0 };\n\t\tvar imageRatio = imageWidth / imageHeight;\n\t\tvar boxRatio = boxWidth / boxHeight;\n\t\tif(imageRatio < boxRatio){\n\t\t\tlayout.w = boxWidth;\n\t\t\tlayout.h = Math.round(boxWidth / imageRatio);\n\t\t\tlayout.y = Math.round(boxHeight/2 - layout.h/2);\n\t\t} else {\n\t\t\tlayout.w = Math.round(boxHeight * imageRatio);\n\t\t\tlayout.h = boxHeight;\n\t\t\tlayout.x = Math.round(boxWidth/2 - layout.w/2);\n\t\t}\n\t\treturn layout;\n\t}\n}\n\n@bar\nexport default class Image{\n}\n";
                var transpiled = src_1.transpile(source, config2);
                chai_6.expect(function () { return eval(transpiled.code); }).not.to.throw();
            });
        });
    });
});
define("test/visitor.spec", ["require", "exports", 'typescript', 'chai', "test-kit/index", "src/configuration", "src/traverse-ast", "src/transpiler-context", "src/mutable-source-code"], function (require, exports, ts, chai_7, index_4, configuration_6, traverse_ast_5, transpiler_context_4, mutable_source_code_9) {
    "use strict";
    function applyVisitor(source, visitor) {
        var ast = ts.createSourceFile('test.ts', source, configuration_6.defaultCompilerOptions.target, true);
        var context = new transpiler_context_4.TranspilerContext(ast.fileName);
        traverse_ast_5.traverseAst(ast, visitor, context);
        var mutable = new mutable_source_code_9.MutableSourceCode(ast);
        mutable.execute(context.actions);
        return {
            code: mutable.code,
            diags: context.diags,
            sourceMap: mutable.sourceMap,
            halted: context.halted
        };
    }
    function matchDiagRanges(expected, actual) {
        chai_7.expect({
            start: expected.pos,
            end: expected.end
        }).to.eqls({
            start: actual.start,
            end: actual.start + actual.length
        });
    }
    describe('given source code', function () {
        describe('and a simple visitor, transpiler should', function () {
            var source = '\nclass A {}\nclass B {}\n';
            var fakeVisitor = {
                filter: function (node) {
                    return node.kind == ts.SyntaxKind.ClassDeclaration;
                },
                visit: function (node, context) {
                    context.insertLine(node.getStart(), '@blah');
                    context.replace(node.getStart(), node.getStart() + 'class'.length, 'interface');
                    context.reportDiag(node, ts.DiagnosticCategory.Error, 'Test message');
                }
            };
            var postVisitorOutput;
            beforeEach(function () {
                postVisitorOutput = applyVisitor(source, fakeVisitor);
            });
            var target = '\n@blah\ninterface A {}\n@blah\ninterface B {}\n';
            it('generate the correct intermediate code', function () {
                chai_7.expect(postVisitorOutput.code).to.equal(target);
            });
            it('give correct diag positions', function () {
                chai_7.expect(postVisitorOutput.diags).to.have.length(2);
                matchDiagRanges(index_4.findCodeRange(source, 'class A {}'), postVisitorOutput.diags[0]);
                matchDiagRanges(index_4.findCodeRange(source, 'class B {}'), postVisitorOutput.diags[1]);
            });
        });
        describe('and a recursive visitor, transpiler should', function () {
            var source = 'class A { methodA() {} }\nclass B { methodB() {} }';
            var subVisitor = {
                filter: function (node) {
                    return node.kind == ts.SyntaxKind.MethodDeclaration;
                },
                visit: function (node, context) {
                    context.insertLine(node.getStart(), '@blah');
                }
            };
            var fakeVisitor = {
                filter: function (node) {
                    return node.kind == ts.SyntaxKind.ClassDeclaration;
                },
                visit: function (node, context, traverse) {
                    traverse(subVisitor);
                }
            };
            var postVisitorOutput;
            beforeEach(function () {
                postVisitorOutput = applyVisitor(source, fakeVisitor);
            });
            it('generate the correct intermediate code', function () {
                chai_7.expect(postVisitorOutput.code).to.equal('class A { @blah\nmethodA() {} }\nclass B { @blah\nmethodB() {} }');
            });
        });
    });
});
define("test/index", ["require", "exports", "test/mutable-source-code.spec", "test/transpile.spec", "test/visitor.spec", "test/transpile.spec", "test/e2e.validate-all.spec", "test/e2e.example-poc.spec", "test/e2e.example-readme.spec"], function (require, exports) {
    "use strict";
    require('source-map-support').install();
});
define("test/mutable-source-actions.spec", ["require", "exports", 'chai', 'typescript', "src/mutable-source-code", "src/configuration", "src/mutable-source-code"], function (require, exports, chai_8, ts, mutable_source_code_10, configuration_7, mutable_source_code_11) {
    "use strict";
    function aSourceMapperFor(source) {
        var ast = ts.createSourceFile('test.ts', source, configuration_7.defaultCompilerOptions.target, true);
        return new mutable_source_code_10.MutableSourceCode(ast);
    }
    describe('Mutable source actions performs', function () {
        it('FastAppendAction at the end of source', function () {
            var source = "const someCode = 'Some string';";
            var mutableCode = aSourceMapperFor(source);
            mutableCode.execute([new mutable_source_code_11.FastAppendAction('const b = 666;')]);
            chai_8.expect(mutableCode.code).to.equal("const someCode = 'Some string';const b = 666;");
        });
        it('FastRewriteAction', function () {
            var source = "const someCode = 'Some string';";
            //              0123456789012345678901234567890
            //                        1         2         3
            var mutableCode = aSourceMapperFor(source);
            mutableCode.execute([new mutable_source_code_11.FastRewriteAction(18, 'XXXXXXXXXXX')]);
            chai_8.expect(mutableCode.code).to.equal("const someCode = 'XXXXXXXXXXX';");
        });
        it('ReplaceAction - replace style', function () {
            var source = "const someCode = 'Some string';";
            //              0123456789012345678901234567890
            //                        1         2         3
            var mutableCode = aSourceMapperFor(source);
            mutableCode.execute([new mutable_source_code_11.ReplaceAction(6, 30, 'b = 666')]);
            chai_8.expect(mutableCode.code).to.equal('const b = 666;');
        });
        it('InsertAction', function () {
            var source = "const someCode = 'Some string';";
            //              0123456789012345678901234567890
            //                        1         2         3
            var mutableCode = aSourceMapperFor(source);
            mutableCode.execute([new mutable_source_code_11.InsertAction(6, '__')]);
            chai_8.expect(mutableCode.code).to.equal("const __someCode = 'Some string';");
        });
        it('InsertAction (beginning)', function () {
            var source = "const someCode = 'Some string';";
            //              0123456789012345678901234567890
            //                        1         2         3
            var mutableCode = aSourceMapperFor(source);
            mutableCode.execute([new mutable_source_code_11.InsertAction(0, '__')]);
            chai_8.expect(mutableCode.code).to.equal("__const someCode = 'Some string';");
        });
        it('several actions in sequence', function () {
            var source = "const someCode = 'Some string';";
            //              0123456789012345678901234567890
            //                        1         2         3
            var mutableCode = aSourceMapperFor(source);
            mutableCode.execute([
                new mutable_source_code_11.ReplaceAction(6, 6, '__'),
                new mutable_source_code_11.FastAppendAction('const b = 666;'),
                new mutable_source_code_11.FastRewriteAction(18, 'XXXXXXXXXXX')
            ]);
            chai_8.expect(mutableCode.code).to.equal("const __someCode = 'XXXXXXXXXXX';const b = 666;");
        });
    });
});
//# sourceMappingURL=tspoon.js.map