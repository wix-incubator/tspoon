# dependency injection example
In this example we introduce a simple dependency injection system that does all it's heavy lifting in compile time.

## structure
### src.ts
This is an example typescript code for how someone might use this system.
The example defines a Model interface with an ```action()``` method, then a Controller class that expects to have a model injected to it.
Finally, it defines an implementation of Model that will be created as a singleton and injected to each Controller instance.

### build.ts
This code translates ```src.ts``` and produces ES5 code with the wiring logic inlined.

## how to build and run from source
compile build.ts to build.js using vanilla Typescript,
Then run build.js which will use tspoon together with Typescript to compile src.ts into stc.js
from the example-di folder, run:
```shell
../node_modules/typescript/bin/tsc build.ts
node build.js
```

