import * as JSON5 from 'json5';

import { readJsonWithImports } from './readJsonWithImports';


const jsonParser = JSON5.parse;

describe('readJsonWithImports', () => {

   test('no imports', async () => {
      const content = await readJsonWithImports('test-data/no-imports.json');
      expect(content).toStrictEqual({
         null: null,
         boolean: false,
         number: 0,
         string: '',
         emptyObject: {},
         singlePropObject: {
            foo: 'bar'
         },
         multiPropObject: {
            a: 1,
            b: 2,
            c: 3,
         },
         array: [1, 2, 3],
      });
   });

   test('text imports', async () => {
      const content = await readJsonWithImports('test-data/text-imports.json');
      expect(content).toStrictEqual({
         null: null,
         boolean: false,
         number: 0,
         string: '',
         emptyObject: {},
         singlePropObject: {
            foo: 'bar'
         },
         multiPropObject: {
            a: 1,
            b: 2,
            textImport: 'Hello there 1,\nthis is a UTF-8 encoded text file!\n·×\n',
            c: 3,
         },
         array: [1, 2, 'Hello there 2,\nthis is a UTF-8 encoded text file!\n·×\n', 3],
      });
   });

   test('line imports', async () => {
      const content = await readJsonWithImports('test-data/line-imports.json');
      expect(content).toStrictEqual({
         null: null,
         boolean: false,
         number: 0,
         string: '',
         emptyObject: {},
         singlePropObject: {
            foo: 'bar'
         },
         multiPropObject: {
            a: 1,
            b: 2,
            lineImport: 'Hello there 1,',
            c: 3,
         },
         array: [1, 2, 'Hello there 2,', 3],
      });
   });

   test('multiple line imports in a single value', async () => {
      const content1 = await readJsonWithImports('test-data/multiple-line-imports-1.json');
      expect(content1).toBe('Hello there 1,Hello there 2,');
      const content2 = await readJsonWithImports('test-data/multiple-line-imports-2.json');
      expect(content2).toBe('<<<Hello there 1,|||Hello there 2,>>>');
   });

   test('top level import', async () => {
      const content = await readJsonWithImports('test-data/top-level-import.json');
      expect(content).toStrictEqual({
         null: null,
         boolean: false,
         number: 0,
         string: '',
         emptyObject: {},
         singlePropObject: {
            foo: 'bar'
         },
         multiPropObject: {
            a: 1,
            b: 2,
            c: 3,
         },
         array: [1, 2, 3],
      });
   });

   test('self import', async () => {
      await expect(() => readJsonWithImports('test-data/self-import.json')).rejects.toBeDefined();
   });

   test('circular import', async () => {
      await expect(() => readJsonWithImports('test-data/circular-import-1.json')).rejects.toBeDefined();
   });

   test('import without filename', async () => {
      await expect(() => readJsonWithImports('test-data/import-without-filename.json')).rejects.toBeDefined();
   });

   test('import with empty filename', async () => {
      await expect(() => readJsonWithImports('test-data/import-with-empty-filename.json')).rejects.toBeDefined();
   });

   test('line import without filename', async () => {
      await expect(() => readJsonWithImports('test-data/line-import-without-filename.json')).rejects.toBeDefined();
   });

   test('line import with empty filename', async () => {
      await expect(() => readJsonWithImports('test-data/line-import-with-empty-filename.json')).rejects.toBeDefined();
   });

   test('text import without filename', async () => {
      await expect(() => readJsonWithImports('test-data/text-import-without-filename.json')).rejects.toBeDefined();
   });

   test('text import with empty filename', async () => {
      await expect(() => readJsonWithImports('test-data/text-import-with-empty-filename.json')).rejects.toBeDefined();
   });

   test('combined import', async () => {
      await expect(() => readJsonWithImports('test-data/combined-import-1.json')).rejects.toBeDefined();
      await expect(() => readJsonWithImports('test-data/combined-import-2.json')).rejects.toBeDefined();
      await expect(() => readJsonWithImports('test-data/combined-import-3.json')).rejects.toBeDefined();
   });

   test('illegal macro name', async () => {
      await expect(() => readJsonWithImports('test-data/illegal-macro-name.json')).rejects.toBeDefined();
   });

   test('undefined macro', async () => {
      await expect(() => readJsonWithImports('test-data/undefined-macro.json')).rejects.toBeDefined();
   });

   test('maxDepth', async () => {
      await expect(readJsonWithImports('test-data/max-depth-1.json')).resolves.toStrictEqual([1, [2, [3, [4]]]]);
      await expect(readJsonWithImports('test-data/max-depth-1.json', { maxDepth: 3 })).resolves.toStrictEqual([1, [2, [3, [4]]]]);
      await expect(() => readJsonWithImports('test-data/max-depth-1.json', { maxDepth: 2 })).rejects.toBeDefined();
   });

   test('custom parser', async () => {
      const content = await readJsonWithImports('test-data/no-imports.json5', { jsonParser });
      expect(content).toStrictEqual({
         null: null,
         boolean: false,
         number: 0,
         string: '',
         emptyObject: {},
         singlePropObject: {
            foo: 'bar'
         },
         multiPropObject: {
            a: 1,
            b: 2,
            c: 3,
         },
         array: [1, 2, 3],
      });
   });

   test('ignores undefined options', async () => {
      const content = await readJsonWithImports('test-data/no-imports.json', { specialCharacter: undefined, jsonParser: undefined });
      expect(content).toStrictEqual({
         null: null,
         boolean: false,
         number: 0,
         string: '',
         emptyObject: {},
         singlePropObject: {
            foo: 'bar'
         },
         multiPropObject: {
            a: 1,
            b: 2,
            c: 3,
         },
         array: [1, 2, 3],
      });
   });

});
