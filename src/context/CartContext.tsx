import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { cartCount, cartReducer, cartSubtotal, sanitizeLines, type CartLine } from '../lib/cart';
import { getProduct, isPurchasable, type Product } from '../data/products';

const STORAGE_KEY = 'durani-cart-v1';

const priceOf = (slug: string): number | null => {
  const product = getProduct(slug);
  return product && isPurchasable(product) ? product.price : null;
};

function loadLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeLines(JSON.parse(raw), priceOf) : [];
  } catch {
    // Storage blocked (private mode, disabled cookies) or corrupt JSON: start empty.
    return [];
  }
}

function saveLines(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Quota exceeded or storage blocked: the cart still works for this session.
  }
}

export interface CartItem extends CartLine {
  product: Product & { price: number };
  lineTotal: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  /** Returns false when the product cannot be purchased (e.g. price not confirmed). */
  addItem: (slug: string, quantity?: number, options?: { openDrawer?: boolean }) => boolean;
  setQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, undefined, loadLines);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => saveLines(lines), [lines]);

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) dispatch({ type: 'replace', lines: loadLines() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback<CartContextValue['addItem']>((slug, quantity = 1, options) => {
    if (priceOf(slug) === null) return false;
    dispatch({ type: 'add', slug, quantity });
    if (options?.openDrawer ?? true) setIsOpen(true);
    return true;
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const items: CartItem[] = [];
    for (const line of lines) {
      const product = getProduct(line.slug);
      if (product && isPurchasable(product)) {
        items.push({ ...line, product, lineTotal: product.price * line.quantity });
      }
    }
    return {
      items,
      count: cartCount(lines),
      subtotal: cartSubtotal(lines, priceOf),
      isOpen,
      addItem,
      setQuantity: (slug, quantity) => dispatch({ type: 'setQuantity', slug, quantity }),
      removeItem: (slug) => dispatch({ type: 'remove', slug }),
      clear: () => dispatch({ type: 'clear' }),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [lines, isOpen, addItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
