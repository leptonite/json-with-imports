import fs from 'fs';
import path from 'path';

import { hasExactlyOneProperty } from './hasExactlyOneProperty';
import { JsonValue } from './JsonValue';


export interface Options {
   maxDepth: number | undefined;
   parser: (text: string) => JsonValue;
}

const defaultOptions: Options = {
   maxDepth: undefined,
   parser: JSON.parse,
};

export async function readJsonWithImports(file: string, options: Partial<Options> = {}): Promise<JsonValue> {
   return readHelper(
      path.resolve(file),
      [],
      { ...defaultOptions, ...options },
   );
}

async function readHelper(absoluteFile: string, importChain: Array<string>, options: Options): Promise<JsonValue> {
   if (options.maxDepth !== undefined && importChain.length > options.maxDepth) {
      throw new Error(`max depth exceeded: ${importChain.join(' → ')} → ${absoluteFile}`);
   }

   if (importChain.includes(absoluteFile)) {
      throw new Error(`circular import: ${importChain.join(' → ')} → ${absoluteFile}`);
   }

   const content = await fs.promises.readFile(absoluteFile, 'utf-8');
   const parsedContent = options.parser(content);

   async function resolveImports(jsonValue: JsonValue): Promise<JsonValue | undefined> {
      if (Array.isArray(jsonValue)) {
         for (let i = 0; i < jsonValue.length; i++) {
            const resolvedImport = await resolveImports(jsonValue[i]!);
            if (resolvedImport !== undefined) {
               jsonValue[i] = resolvedImport;
            }
         }
         return undefined;
      }

      if (jsonValue !== null && typeof jsonValue === 'object') {
         if (hasExactlyOneProperty(jsonValue)) {
            if (typeof jsonValue['@import'] === 'string') {
               const fileToImport = path.resolve(path.dirname(absoluteFile), jsonValue['@import']);
               return await readHelper(fileToImport, [...importChain, absoluteFile], options);
            }

            if (typeof jsonValue['@import-text'] === 'string') {
               const fileToImport = path.resolve(path.dirname(absoluteFile), jsonValue['@import-text']);
               return await fs.promises.readFile(fileToImport, 'utf-8');
            }

            if (typeof jsonValue['@import-first-line'] === 'string') {
               const fileToImport = path.resolve(path.dirname(absoluteFile), jsonValue['@import-first-line']);
               const contentToImport = await fs.promises.readFile(fileToImport, 'utf-8');
               return contentToImport.split('\n', 2)[0];
            }
         }

         for (const key in jsonValue) {
            const resolvedImport = await resolveImports(jsonValue[key]!);
            if (resolvedImport !== undefined) {
               jsonValue[key] = resolvedImport;
            }
         }
         return undefined;
      }

      return undefined;
   }

   const resolvedImport = await resolveImports(parsedContent);

   return resolvedImport ?? parsedContent;
}
