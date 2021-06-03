json-with-imports
=================

The function `readJsonWithImports` reads and parses JSON files and supports a special syntax for imports:

* Use `{ "@import": "path/to/file.json" }` to import another json file.
* Use `{ "@import-text": "path/to/file.txt" }` to import a text file as a single string.
* Use `{ "@import-first-line": "path/to/file.txt" }` to import the first line of a text file as a single string.

All files are expected to be UTF-8 encoded. Paths may be absolute or relative to the importing file.

Example:

```
const parsedData = await readJsonWithImports('path/to/file.json');
```

The given path may be absolute or relative to the current working directory.


Limit import depth
------------------

You may limit import depth with the `maxDepth` option. Default is no limit.

Example:

```
const parsedData = await readJsonWithImports('path/to/file.json', { maxDepth: 3 });
```

`maxDepth: 0` does not allow imports at all. `maxDepth: 1` allows imports in the given file but not in imported files and so on. `maxDepth` only affects `@import` but neither `@import-text` nor `@import-first-line` which are always allowed.


Custom parser
-------------

You may use a custom parser instead of `JSON.parse` with the `parser` option.

This may be used to support JSON5 for example:

```
import * as JSON5 from 'json5';

[...]

const parsedData = await readJsonWithImports('path/to/file.json5', { parser: JSON5.parse });
```

The optional `reviver` argument of `JSON.parse` is not supported.
