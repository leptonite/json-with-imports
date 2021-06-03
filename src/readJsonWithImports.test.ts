import * as JSON5 from 'json5';

import { readJsonWithImports } from './readJsonWithImports';


const parser = JSON5.parse;

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

   test('maxDepth', async () => {
      await expect(readJsonWithImports('test-data/max-depth-1.json')).resolves.toStrictEqual([1, [2, [3, [4]]]]);
      await expect(readJsonWithImports('test-data/max-depth-1.json', { maxDepth: 3 })).resolves.toStrictEqual([1, [2, [3, [4]]]]);
      await expect(() => readJsonWithImports('test-data/max-depth-1.json', { maxDepth: 2 })).rejects.toBeDefined();
   });

   test('custom parser', async () => {
      const content = await readJsonWithImports('test-data/no-imports.json5', { parser });
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
