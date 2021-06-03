export type JsonValue = null | boolean | number | string | Array<JsonValue> | JsonObject;
export type JsonObject = { [key: string]: JsonValue };
