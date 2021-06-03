import { JsonObject } from './JsonValue';


export function hasExactlyOneProperty(jsonObject: JsonObject): boolean {
   let propFound = false;
   for (const _key in jsonObject) {
      if (propFound) {
         return false;
      }
      propFound = true;
   }
   return propFound;
}
