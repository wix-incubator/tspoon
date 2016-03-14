# Readme example
In this example we introduce a simple proof of concept visitor, that reports a message per property declaration.
## How to build and run from source
After installing and building Tspoon, run build.js which will use Tspoon together with Typescript to compile src.ts into stc.js
from the example-di folder, run ```node build.js``` in this folder like so:
```shell
$ cd ./example/readme
$ ls
README.md               build.js                alertProperty.js        src.ts
$ node build.js
-> src.ts:2:1 : found property declaration "private privateName : string = 'John';"
-> src.ts:3:1 : found property declaration "public publicName : string = 'Doe';"
$ ls
README.md               build.js                alertProperty.js        src.js                  src.js.map              src.ts
```

## Structure
- **`./alertProperty.js`** - this file exposes a single visitor that only operates on property declarations, and reports a message for each one of them.
- **`./src.ts`** - this is an example typescript code that will be subject to the visitor.
The example defines ```class TwoNames``` with two fields: one public and one private.
- **`./build.js`** - This code translates ```src.ts``` and produces ES5 code after applying the ```alertProperty``` logic on it.
