import { hasExactlyOneProperty } from './hasExactlyOneProperty';


test('empty object', () => {
   expect(hasExactlyOneProperty({})).toBe(false);
});

test('single property', () => {
   expect(hasExactlyOneProperty({ a: 1 })).toBe(true);
});

test('two properties', () => {
   expect(hasExactlyOneProperty({ a: 1, b: 2 })).toBe(false);
});

test('three properties', () => {
   expect(hasExactlyOneProperty({ a: 1, b: 2, c: 3 })).toBe(false);
});
