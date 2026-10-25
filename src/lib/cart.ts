/** Pure cart logic — no React, no DOM — so it can be unit tested with `node --test`. */

export interface CartLine {
  slug: string;
  quantity: number;
}

export type CartAction =
  | { type: 'add'; slug: string; quantity: number }
  | { type: 'setQuantity'; slug: string; quantity: number }
  | { type: 'remove'; slug: string }
  | { type: 'clear' }
  | { type: 'replace'; lines: CartLine[] };

/** Returns the unit price in PKR for a purchasable product, or null if it cannot be bought. */
export type PriceLookup = (slug: string) => number | null;

export const MAX_QUANTITY = 10;

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));
}

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const existing = lines.find((l) => l.slug === action.slug);
      if (existing) {
        return lines.map((l) =>
          l.slug === action.slug ? { ...l, quantity: clampQuantity(l.quantity + action.quantity) } : l,
        );
      }
      return [...lines, { slug: action.slug, quantity: clampQuantity(action.quantity) }];
    }
    case 'setQuantity':
      return lines.map((l) => (l.slug === action.slug ? { ...l, quantity: clampQuantity(action.quantity) } : l));
    case 'remove':
      return lines.filter((l) => l.slug !== action.slug);
    case 'clear':
      return [];
    case 'replace':
      return action.lines;
  }
}

/**
 * Validates untrusted data (e.g. from localStorage). Drops malformed entries,
 * unknown products and products without a confirmed price; merges duplicates.
 */
export function sanitizeLines(raw: unknown, priceOf: PriceLookup): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, number>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { slug, quantity } = item as Record<string, unknown>;
    if (typeof slug !== 'string' || typeof quantity !== 'number') continue;
    if (priceOf(slug) === null) continue;
    merged.set(slug, clampQuantity((merged.get(slug) ?? 0) + quantity));
  }
  return [...merged].map(([slug, quantity]) => ({ slug, quantity }));
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

/** Subtotal in whole PKR. Lines without a price are excluded. */
export function cartSubtotal(lines: CartLine[], priceOf: PriceLookup): number {
  return lines.reduce((sum, l) => {
    const price = priceOf(l.slug);
    return price === null ? sum : sum + price * l.quantity;
  }, 0);
}
