# tspoon
Customizing TypeScript semantics by introducing a visitors engine.
### who should use this tool
Tspoon will help you define a powerful [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) on top of Typescript.
Tspoon uses [Typescript's compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) to allow pluggable pieces of logic modify the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree).
```static analysis + DSL => pluggable AST visitors```
## Users Documentation

### how to write a visitor

### how to use tspoon in your project

## Developer Documentation

### how to build and test locally from source
Clone this project localy.
Then, at the root folder of the project, run:
```shell
npm install
npm run build
npm test
```
### how to run local continous test feedback
At the root folder of the project, run:
```shell
npm start
```
Then, open your browser at http://localhost:8080/webtest.bundle
and see any changes you make in tests or code reflected in the browser

### License
TBD
