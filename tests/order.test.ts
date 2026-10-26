// Run with: npm test  (uses Node's built-in test runner and type stripping)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOrderMessage, createOrderReference, formatRs, orderTotals, whatsappOrderUrl } from '../src/lib/order.ts';

// Test-only fixture lines; these are not product data.
const lines = [
  { name: 'Serum A', quantity: 2, unitPrice: 800 },
  { name: 'Polish B', quantity: 1, unitPrice: 500 },
];
const customer = { name: '  Ayesha Khan ', phone: '0300 1234567', address: 'House 5, Street 2\nLahore' };

test('totals add delivery only when it is confirmed', () => {
  assert.deepEqual(orderTotals(lines, null), { subtotal: 2100, delivery: null, total: 2100 });
  assert.deepEqual(orderTotals(lines, 200), { subtotal: 2100, delivery: 200, total: 2300 });
});

test('formats rupees with thousands separators', () => {
  assert.equal(formatRs(2100), 'Rs. 2,100');
  assert.equal(formatRs(500), 'Rs. 500');
});

test('message follows the order format and states that delivery is excluded', () => {
  assert.equal(
    buildOrderMessage('DC-261026-ABCD', customer, lines, null),
    [
      'Hello Durani Cosmetics! Please confirm my order.',
      '',
      'Order Reference: DC-261026-ABCD',
      'Name: Ayesha Khan',
      'Phone: 0300 1234567',
      'Delivery Address: House 5, Street 2, Lahore',
      '',
      'Items:',
      'Serum A × 2 — Rs. 1,600',
      'Polish B × 1 — Rs. 500',
      '',
      'Subtotal: Rs. 2,100',
      'Delivery: To be confirmed',
      'Total: Rs. 2,100 (excluding delivery)',
      '',
      'Please confirm availability and delivery.',
    ].join('\n'),
  );
});

test('message includes a confirmed delivery charge in the total', () => {
  const message = buildOrderMessage('DC-1', customer, lines, 250);
  assert.match(message, /\nDelivery: Rs\. 250\n/);
  assert.match(message, /\nTotal: Rs\. 2,350\n/);
});

test('reference has the date and an unambiguous code', () => {
  const ref = createOrderReference(new Date(2026, 9, 26), () => 0.5);
  assert.equal(ref, 'DC-261026-JJJJ');
  for (let i = 0; i < 50; i++) assert.match(createOrderReference(), /^DC-\d{6}-[2-9A-HJ-NP-Z]{4}$/);
});

test('URL targets the number and round-trips the encoded message', () => {
  const message = buildOrderMessage('DC-1', customer, lines, null);
  const url = whatsappOrderUrl('923329186395', message);
  assert.ok(url.startsWith('https://wa.me/923329186395?text='));
  assert.equal(decodeURIComponent(url.split('?text=')[1]), message);
  assert.ok(!/[\s×—]/.test(url), 'URL must be fully encoded');
});
