import { SpecialCharacter } from './MacroParser';
import { readJsonWithImports } from './readJsonWithImports';


const usage = `
usage: json-with-imports [--max-depth=MAX_DEPTH] [--special-character=SPECIAL_CHARACTER] FILE.json
   MAX_DEPTH must be a non-negative integer
   SPECIAL_CHARACTER must be one of '#', '$', '%', '&', '@'
`.trim();

function usageError(): never {
   throw new Error(usage);
}

export function parseIntStrict(s: string): number {
   const i = parseInt(s, 10);
   if (isNaN(i) || i.toString() !== s) {
      return Number.NaN;
   }
   if (i < Number.MIN_SAFE_INTEGER || i > Number.MAX_SAFE_INTEGER) {
      return Number.NaN;
   }
   return i;
}

export async function main() {
   try {
      let maxDepth: number | undefined;
      let specialCharacter: SpecialCharacter | undefined;
      let file: string | undefined;

      for (const arg of process.argv.slice(2)) {
         if (arg.startsWith('--max-depth=')) {
            if (maxDepth !== undefined) {
               usageError();
            }
            const value = parseIntStrict(arg.substring(12));
            if (isNaN(value) || value < 0) {
               usageError();
            }
            maxDepth = value;
         }
         else if (arg.startsWith('--special-character=')) {
            if (specialCharacter !== undefined) {
               usageError();
            }
            const value = arg.substring(20);
            if (value !== '#' && value !== '$' && value !== '%' && value !== '&' && value !== '@') {
               usageError();
            }
            specialCharacter = value;
         }
         else if (arg.startsWith('-')) {
            usageError();
         }
         else {
            if (file !== undefined) {
               usageError();
            }
            file = arg;
         }

      }

      if (file === undefined) {
         usageError();
      }

      const jsonValue = await readJsonWithImports(file, { specialCharacter, maxDepth });
      process.stdout.write(JSON.stringify(jsonValue, undefined, 4) + '\n');
   } catch (e) {
      const message = e instanceof Error ? e.message : `${e}`;
      process.stderr.write(`ERROR: ${message}\n`);
   }
}
