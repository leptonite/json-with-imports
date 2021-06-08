import { MacroParser } from './MacroParser';


test('simple string', () => {
   const parser = new MacroParser('$');
   expect(parser.parse('abc123')).toBeUndefined();
});

test('escaped dollar', () => {
   const parser = new MacroParser('$');
   expect(parser.parse('abc$$123')).toStrictEqual(['abc$123']);
});

test('opening brace', () => {
   const parser = new MacroParser('$');
   expect(parser.parse('abc{123')).toBeUndefined();
});

test('escaped dollar followed by opening brace', () => {
   const parser = new MacroParser('$');
   expect(parser.parse('abc$${123')).toStrictEqual(['abc${123']);
});

test('trailing dollar', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('abc$')).toThrow();
});

test('dollar without following { or $', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('abc$foo')).toThrow();
});

test('single macro', () => {
   const parser = new MacroParser('$');
   expect(parser.parse('${foo}')).toStrictEqual([{ name: 'foo', arg: undefined }]);
});

test('single macro with empty arg', () => {
   const parser = new MacroParser('$');
   expect(parser.parse('${foo:}')).toStrictEqual([{ name: 'foo', arg: '' }]);
});

test('single macro with non-empty arg', () => {
   const parser = new MacroParser('$');
   expect(parser.parse('${foo:bar}')).toStrictEqual([{ name: 'foo', arg: 'bar' }]);
});

test('single macro with arg containing escaped chracters', () => {
   const parser = new MacroParser('$');
   expect(parser.parse('${foo:b$$a$}r}')).toStrictEqual([{ name: 'foo', arg: 'b$a}r' }]);
});

test('unclosed macro', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('${foo')).toThrow();
});

test('unclosed macro with empty arg', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('${foo:')).toThrow();
});

test('unclosed macro with non-empty arg', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('${foo:bar')).toThrow();
});

test('dollar without following } or $ in macro arg', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('${foo:b$ar}')).toThrow();
});

test('macro with empty name and without arg', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('${}')).toThrow();
});

test('macro with empty name and empty arg', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('${:}')).toThrow();
});

test('macro with empty name and non-empty arg', () => {
   const parser = new MacroParser('$');
   expect(() => parser.parse('${:bar}')).toThrow();
});

test('percent sign as special character', () => {
   const parser = new MacroParser('%');
   expect(parser.parse('%{foo:b%%a%}r}')).toStrictEqual([{ name: 'foo', arg: 'b%a}r' }]);
});
