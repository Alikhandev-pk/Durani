/** Pure WhatsApp order helpers — no React, no DOM — so they can be unit tested with `node --test`. */

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
}

export interface OrderLine {
  name: string;
  quantity: number;
  /** Unit price in whole PKR. */
  unitPrice: number;
}

export interface OrderTotals {
  subtotal: number;
  /** null while the delivery charge is not confirmed. */
  delivery: number | null;
  /** Subtotal plus delivery; equals the subtotal while delivery is unconfirmed. */
  total: number;
}

const rupees = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

/** "Rs. 1,300" */
export function formatRs(amount: number): string {
  return `Rs. ${rupees.format(amount)}`;
}

export function orderTotals(lines: OrderLine[], delivery: number | null): OrderTotals {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  return { subtotal, delivery, total: subtotal + (delivery ?? 0) };
}

/**
 * Short reference the customer and Durani can quote in the chat, e.g.
 * "DC-261026-7K3Q". Not a confirmation: nothing is recorded until Durani replies.
 */
export function createOrderReference(date = new Date(), random: () => number = Math.random): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${pad(date.getFullYear() % 100)}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  // No 0/O or 1/I so the code is easy to read back.
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(random() * alphabet.length)];
  return `DC-${day}-${code}`;
}

export function buildOrderMessage(
  reference: string,
  customer: OrderCustomer,
  lines: OrderLine[],
  delivery: number | null,
): string {
  const { subtotal, total } = orderTotals(lines, delivery);
  return [
    'Hello Durani Cosmetics! Please confirm my order.',
    '',
    `Order Reference: ${reference}`,
    `Name: ${customer.name.trim()}`,
    `Phone: ${customer.phone.trim()}`,
    `Delivery Address: ${customer.address.trim().replace(/\s*\n\s*/g, ', ')}`,
    '',
    'Items:',
    ...lines.map((l) => `${l.name} × ${l.quantity} — ${formatRs(l.unitPrice * l.quantity)}`),
    '',
    `Subtotal: ${formatRs(subtotal)}`,
    `Delivery: ${delivery === null ? 'To be confirmed' : formatRs(delivery)}`,
    `Total: ${formatRs(total)}${delivery === null ? ' (excluding delivery)' : ''}`,
    '',
    'Please confirm availability and delivery.',
  ].join('\n');
}

/** wa.me link with the message prefilled. `number` is international format without "+". */
export function whatsappOrderUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
