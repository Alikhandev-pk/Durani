// Run with: npm test  (uses Node's built-in test runner and type stripping)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cartReducer,
  sanitizeLines,
  cartCount,
  cartSubtotal,
  clampQuantity,
  MAX_QUANTITY,
  type CartLine,
} from '../src/lib/cart.ts';

// Test-only fixture prices; these are not product data.
const prices: Record<string, number | null> = { a: 1000, b: 250, unpriced: null };
const priceOf = (slug: string) => prices[slug] ?? null;

test('add merges quantities for the same product', () => {
  let lines: CartLine[] = [];
  lines = cartReducer(lines, { type: 'add', slug: 'a', quantity: 1 });
  lines = cartReducer(lines, { type: 'add', slug: 'a', quantity: 2 });
  lines = cartReducer(lines, { type: 'add', slug: 'b', quantity: 1 });
  assert.deepEqual(lines, [
    { slug: 'a', quantity: 3 },
    { slug: 'b', quantity: 1 },
  ]);
});

test('quantity is clamped between 1 and MAX_QUANTITY', () => {
  assert.equal(clampQuantity(0), 1);
  assert.equal(clampQuantity(-5), 1);
  assert.equal(clampQuantity(NaN), 1);
  assert.equal(clampQuantity(999), MAX_QUANTITY);
  const lines = cartReducer([{ slug: 'a', quantity: 9 }], { type: 'add', slug: 'a', quantity: 5 });
  assert.equal(lines[0].quantity, MAX_QUANTITY);
});

test('setQuantity and remove', () => {
  let lines: CartLine[] = [{ slug: 'a', quantity: 1 }, { slug: 'b', quantity: 2 }];
  lines = cartReducer(lines, { type: 'setQuantity', slug: 'b', quantity: 4 });
  assert.equal(lines[1].quantity, 4);
  lines = cartReducer(lines, { type: 'remove', slug: 'a' });
  assert.deepEqual(lines, [{ slug: 'b', quantity: 4 }]);
  assert.deepEqual(cartReducer(lines, { type: 'clear' }), []);
});

test('subtotal and count are accurate', () => {
  const lines = [{ slug: 'a', quantity: 2 }, { slug: 'b', quantity: 3 }];
  assert.equal(cartSubtotal(lines, priceOf), 2 * 1000 + 3 * 250);
  assert.equal(cartCount(lines), 5);
});

test('sanitizeLines rejects malformed, unknown and unpriced items', () => {
  assert.deepEqual(sanitizeLines('not an array', priceOf), []);
  assert.deepEqual(sanitizeLines(null, priceOf), []);
  const result = sanitizeLines(
    [
      { slug: 'a', quantity: 1 },
      { slug: 'a', quantity: 2 },
      { slug: 'unpriced', quantity: 1 },
      { slug: 'missing', quantity: 1 },
      { slug: 'b', quantity: '3' },
      null,
      42,
    ],
    priceOf,
  );
  assert.deepEqual(result, [{ slug: 'a', quantity: 3 }]);
});
