# POC example
In this example we introduce a simple proof of concept transformation, that deletes private class properties.

## how to build and run from source
After installing and building Tspoon, run build.js which will use Tspoon together with Typescript to compile src.ts into stc.js
from the example-di folder, run ```node build.js``` in this folder like so:
```shell
$ cd ./example-poc
$ ls
README.md               build.js                deletePrivate.js        src.ts
$ node build.js
-> src.ts:2:1 : deleted field "private privateName : string = 'John';"
$ ls
README.md               build.js                deletePrivate.js        src.js                  src.js.map              src.ts
```
## structure
### deletePrivate.js
This file defines the transformation that should be applied. it exposes a single visitor that only operates on properties declarations with the ```private``` modifier, and completely deletes them.

### src.ts
This is an example typescript code that will be subject to the visitor's transformations.
The example defines ```class TwoNames``` with two fields: one public and one private.

### build.js
This code translates ```src.ts``` and produces ES5 code after applying the ```deletePrivate``` logic on it.


