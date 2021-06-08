json-with-imports
=================

The function `readJsonWithImports` reads and parses JSON files and supports a special syntax for imports:

* Use `"${import:path/to/file.json}"` to import another json file.
* Use `"${import-text:path/to/file.txt}"` to import a text file as a single string.
* Use `"${import-first-line:path/to/file.txt}"` to import the first line of a text file as a single string.

You can use `import-text` and `import-first-line` together with plain strings:

* `"the file path/to/file.txt contains this text:\n${import-text:path/to/file.txt}"`
* `"the file path/to/file.txt starts with this line:\n${import-first-line:path/to/file.txt}"`
* `"the file path/to/file.txt starts with this line:\n${import-first-line:path/to/file.txt}\nand contains this text:\n${import-text:path/to/file.txt}"`

All files are expected to be UTF-8 encoded. Paths may be absolute or relative to the importing file.

Example:

```
const parsedData = await readJsonWithImports('path/to/file.json');
```

The given path may be absolute or relative to the current working directory.


Escape special character
------------------------

If you want to use a literal `$` in your strings or a literal `}` in your file name, you can escape it with another `$`:

`"the file file-with-{$$trange}-name.txt contains this text:\n${import-text:file-with-{$$trange$}-name.txt}"`

This expects a file named `file-with-{$trange}-name.txt` in the same directory as the importing file.


Custom special character
------------------------

You may use any of `#`, `$`, `%`, `&` or `@` as special character with the `specialCharacter` option. Default is `$` as used in the examples above.

Example:

```
const parsedData = await readJsonWithImports('path/to/file.json', { specialCharacter: '%' });
```

This changes the syntax to `"the file file-with-50%%-{braces}.txt contains this text:\n%{import-text:file-with-50%%-{braces%}.txt}"` (expects a file named `file-with-50%-{braces}.txt`).


Limit import depth
------------------

You may limit import depth with the `maxDepth` option. Default is no limit.

Example:

```
const parsedData = await readJsonWithImports('path/to/file.json', { maxDepth: 3 });
```

`maxDepth: 0` does not allow imports at all. `maxDepth: 1` allows imports in the given file but not in imported files and so on. `maxDepth` only affects `import` but neither `import-text` nor `import-first-line` which are always allowed.

`readJsonWithImports` throws an `Error` if `maxDepth` is exceeded.


Custom parser
-------------

You may use a custom parser instead of `JSON.parse` with the `jsonParser` option.

This may be used to support JSON5 for example:

```
import * as JSON5 from 'json5';

[...]

const parsedData = await readJsonWithImports('path/to/file.json5', { jsonParser: JSON5.parse });
```

The optional `reviver` argument of `JSON.parse` is not supported.
