import { useId, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchProducts } from '../data/products';
import { CloseIcon, SearchIcon } from './Icons';
import { Modal } from './Modal';
import { Price } from './Price';
import { ProductImage } from './ProductImage';

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const inputId = useId();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const results = useMemo(() => (query.trim() ? searchProducts(query) : []), [query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    close();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <Modal open={open} onClose={close} labelledBy={titleId} variant="top">
      <div className="bg-ivory shadow-header">
        <div className="container-page py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <h2 id={titleId} className="eyebrow">
              Search products
            </h2>
            <button
              type="button"
              onClick={close}
              className="-mr-2 grid h-11 w-11 place-items-center rounded-full hover:bg-cream"
              aria-label="Close search"
            >
              <CloseIcon />
            </button>
          </div>
          <form role="search" onSubmit={onSubmit} className="mt-3">
            <label htmlFor={inputId} className="sr-only">
              Search Durani products
            </label>
            <div className="flex items-center gap-3 border-b border-espresso/40 pb-2 focus-within:border-gold-deep">
              <SearchIcon className="shrink-0 text-cocoa" />
              <input
                id={inputId}
                type="search"
                data-autofocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Serum, face wash, cream…"
                autoComplete="off"
                className="w-full bg-transparent py-2 font-serif text-xl text-espresso placeholder:text-cocoa/50 focus:outline-none sm:text-2xl"
              />
              <button type="submit" className="btn-primary hidden min-h-10 px-5 sm:inline-flex">
                Search
              </button>
            </div>
          </form>

          <div className="mt-5" aria-live="polite">
            {query.trim() && (
              <p className="mb-3 text-sm text-cocoa">
                {results.length === 0
                  ? `No products match “${query.trim()}”.`
                  : `${results.length} ${results.length === 1 ? 'product' : 'products'} found`}
              </p>
            )}
            {results.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {results.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={`/product/${p.slug}`}
                      onClick={close}
                      className="flex items-center gap-4 rounded-xl border border-line bg-white p-2 pr-4 transition hover:border-champagne"
                    >
                      <div className="w-16 shrink-0">
                        <ProductImage image={p.images[0]} sizes="64px" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif leading-snug">{p.name}</p>
                        <Price price={p.price} className="text-xs" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
