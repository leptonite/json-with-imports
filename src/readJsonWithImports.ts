import fs from 'fs';
import path from 'path';

import { JsonValue } from './JsonValue';
import { MacroParser, SpecialCharacter } from './MacroParser';


export interface Options {
   specialCharacter: SpecialCharacter;
   maxDepth: number | undefined;
   jsonParser: (text: string) => JsonValue;
}

const defaultOptions: Options = {
   specialCharacter: '$',
   maxDepth: undefined,
   jsonParser: JSON.parse,
};

export class JsonReadError extends Error {
   constructor(
      public importChain: Array<string>,
      public details: string,
   ) {
      super(`${details} (${importChain.join(' → ')})`);
   }
}

export async function readJsonWithImports(file: string, options: Partial<Options> = {}): Promise<JsonValue> {
   const optionsWithoutUndefined = { ...options } as any;
   for (const key in optionsWithoutUndefined) {
      if (optionsWithoutUndefined[key] === undefined) {
         delete optionsWithoutUndefined[key];
      }
   }
   const effectiveOptions: Options = { ...defaultOptions, ...optionsWithoutUndefined };

   const macroParser = new MacroParser(effectiveOptions.specialCharacter);
   return readAndParseFile(
      path.resolve(file),
      [],
      effectiveOptions,
      macroParser,
   );
}

async function readAndParseFile(absoluteFile: string, importParents: Array<string>, options: Options, macroParser: MacroParser): Promise<JsonValue> {
   const importChain = [...importParents, absoluteFile];

   if (options.maxDepth !== undefined && importParents.length > options.maxDepth) {
      throw new JsonReadError(importChain, 'max depth exceeded');
   }

   if (importParents.includes(absoluteFile)) {
      throw new JsonReadError(importChain, 'circular import');
   }

   const content = await fs.promises.readFile(absoluteFile, 'utf-8');
   const parsedContent = options.jsonParser(content);

   /**
    * `evaluateMacros` traverses the given `jsonValue` and replaces every macro with its evaluated value.
    * 
    * This function looks a bit strange at first. The idea is that the function works inplace for macros that are nested somewhere in `jsonValue`.
    * In this case it returns undefined. But if the given `jsonValue` itself is a string containing macros, then the evaluated value is returned.
    */
   async function evaluateMacros(jsonValue: JsonValue): Promise<JsonValue | undefined> {
      if (Array.isArray(jsonValue)) {
         for (let i = 0; i < jsonValue.length; i++) {
            const evaluatedMacros = await evaluateMacros(jsonValue[i]!);
            if (evaluatedMacros !== undefined) {
               jsonValue[i] = evaluatedMacros;
            }
         }
         return undefined;
      }

      if (jsonValue !== null && typeof jsonValue === 'object') {
         for (const key in jsonValue) {
            const evaluatedMacros = await evaluateMacros(jsonValue[key]!);
            if (evaluatedMacros !== undefined) {
               jsonValue[key] = evaluatedMacros;
            }
         }
         return undefined;
      }

      if (typeof jsonValue === 'string') {
         const ast = macroParser.parse(jsonValue);
         if (ast === undefined) { // That happens iff jsonValue does not contain anything special.
            return undefined;
         }

         if (ast.length === 1 && typeof ast[0] === 'object' && ast[0].name === 'import') {
            const arg = ast[0].arg;
            if (!arg) {
               throw new JsonReadError(importChain, 'missing filename in macro "import"');
            }
            const fileToImport = path.resolve(path.dirname(absoluteFile), arg);
            return await readAndParseFile(fileToImport, importChain, options, macroParser);
         }

         let result = '';
         for (const node of ast) {
            if (typeof node === 'string') {
               result += node;
            } else {
               switch (node.name) {
                  case 'import': {
                     throw new JsonReadError(importChain, 'macro "import" cannot be used together with string literals or other macros');
                  }

                  case 'import-text': {
                     if (!node.arg) {
                        throw new JsonReadError(importChain, 'missing filename in macro "import-text"');
                     }
                     const fileToImport = path.resolve(path.dirname(absoluteFile), node.arg);
                     const content = await fs.promises.readFile(fileToImport, 'utf-8');
                     result += content;
                     break;
                  }

                  case 'import-first-line': {
                     if (!node.arg) {
                        throw new JsonReadError(importChain, 'missing filename in macro "import-first-line"');
                     }
                     const fileToImport = path.resolve(path.dirname(absoluteFile), node.arg);
                     const content = await fs.promises.readFile(fileToImport, 'utf-8');
                     result += content.split('\n', 2)[0];
                     break;
                  }

                  default: {
                     throw new JsonReadError(importChain, `undefined macro "${node.name}"`);
                  }
               }
            }
         }
         return result;
      }

      return undefined;
   }

   const evaluatedMacros = await evaluateMacros(parsedContent);

   return evaluatedMacros ?? parsedContent;
}
