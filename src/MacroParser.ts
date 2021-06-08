export interface Macro {
   name: string;
   arg: string | undefined;
}

export class ParseError extends Error {
}

export type SpecialCharacter = '#' | '$' | '%' | '&' | '@';

export class MacroParser {

   #specialCharacter: SpecialCharacter;

   constructor(specialCharacter: SpecialCharacter) {
      this.#specialCharacter = specialCharacter;
   }

   /**
    * @param text the string to parse
    * @returns Array of Macros and literal strings or `undefined` if the given `text` does not contain the special character.
    */
   parse(text: string): Array<string | Macro> | undefined {
      // This is a shortcut: If the given text does not contain the special character, we just return undefined to indicate that there’s nothing to do.
      if (text.indexOf(this.#specialCharacter) === -1) {
         return undefined;
      }

      const ast: Array<string | Macro> = [];
      let pos = 0; // points to the next character that must be parsed

      const appendCharacter = (s: string) => {
         if (ast.length > 0 && typeof ast[ast.length - 1] === 'string') {
            ast[ast.length - 1] += s;
         } else {
            ast.push(s);
         }
      };

      const parseMacroName = () => {
         const startPos = pos;
         while (pos < text.length) {
            const character = text[pos]!;
            if (/^[-a-z]$/.test(character)) {
               pos++;
            } else {
               break;
            }
         }
         if (pos === startPos) {
            throw new ParseError(`macro name expected at position ${pos}`);
         }
         return text.substring(startPos, pos);
      };

      const parseMacroArg = () => {
         let arg = '';
         let character: string;
         while (pos < text.length && (character = text[pos]!) !== '}') {
            if (character === this.#specialCharacter) {
               pos++;
               const nextCharacter = text[pos]!;
               if (nextCharacter === this.#specialCharacter || nextCharacter === '}') {
                  arg += nextCharacter;
                  pos++;
               } else {
                  throw new ParseError(`"}" or "${this.#specialCharacter}" expected at position ${pos}`);
               }
            } else {
               arg += character;
               pos++;
            }
         }
         return arg;
      };

      // called after every occurence of this.#specialCharacter
      const parseSpecial = () => {
         if (text.length <= pos) {
            throw new ParseError(`unexpected end of string, "{" or "${this.#specialCharacter}" expected at position ${pos}`);
         }

         if (text[pos] === this.#specialCharacter) {
            appendCharacter(this.#specialCharacter);
            pos++;
            return;
         }

         if (text[pos] === '{') {
            pos++;

            const name = parseMacroName();

            let arg: string | undefined;
            if (text[pos] === ':') {
               pos++;
               arg = parseMacroArg();
            }

            if (text[pos] !== '}') {
               throw new ParseError(`"}" expected at position ${pos}`);
            }
            pos++;

            ast.push({ name, arg });
            return;
         }

         throw new ParseError(`"{" or "${this.#specialCharacter}" expected at position ${pos}`);
      };

      while (pos < text.length) {
         const character = text[pos]!;
         if (character === this.#specialCharacter) {
            pos++;
            parseSpecial();
         } else {
            appendCharacter(character);
            pos++;
         }
      }

      return ast;
   };

}
