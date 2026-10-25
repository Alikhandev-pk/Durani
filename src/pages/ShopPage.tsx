import { useId, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SearchIcon } from '../components/Icons';
import { ProductCard } from '../components/ProductCard';
import { categories, getCategory, products, searchProducts, type Product } from '../data/products';
import { usePageMeta } from '../hooks/usePageMeta';
import { NotFoundPage } from './NotFoundPage';

type SortKey = 'featured' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

const hasPrices = products.some((p) => p.price !== null);

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  // Price sorting is only offered once real prices exist.
  ...(hasPrices
    ? ([
        { value: 'price-asc', label: 'Price: low to high' },
        { value: 'price-desc', label: 'Price: high to low' },
      ] as const)
    : []),
];

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const sorted = [...list];
  // Products without a price always sort last.
  const priceOrInf = (p: Product) => p.price ?? Number.POSITIVE_INFINITY;
  switch (sort) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-asc':
      return sorted.sort((a, b) => priceOrInf(a) - priceOrInf(b));
    case 'price-desc':
      return sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    default:
      return sorted;
  }
}

export function ShopPage() {
  const { category: categorySlug } = useParams();
  const [params, setParams] = useSearchParams();
  const searchId = useId();
  const sortId = useId();

  const category = getCategory(categorySlug);
  const query = params.get('q') ?? '';
  const sortParam = params.get('sort') as SortKey | null;
  const sort: SortKey = sortOptions.some((o) => o.value === sortParam) ? (sortParam as SortKey) : 'featured';

  const results = useMemo(() => {
    const inCategory = category ? products.filter((p) => p.category === category.slug) : products;
    return sortProducts(searchProducts(query, inCategory), sort);
  }, [category, query, sort]);

  const title = category ? category.name : 'Shop All';
  usePageMeta({
    title,
    description: category
      ? `Shop Durani ${category.name} from Durani Cosmetics.`
      : 'Shop all Durani Cosmetics skincare: serum, face washes and beauty cream.',
  });

  if (categorySlug && !category) return <NotFoundPage />;

  const updateParam = (key: string, value: string, fallback = '') => {
    const next = new URLSearchParams(params);
    if (value && value !== fallback) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // Keep the search and sort when switching category.
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const chips = [{ slug: '', name: 'All' }, ...categories];

  return (
    <div className="container-page pt-8 sm:pt-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          ...(category ? [{ label: 'Shop', to: '/shop' }, { label: category.name }] : [{ label: 'Shop' }]),
        ]}
      />
      <header className="mt-6 mb-8 sm:mb-10">
        <h1 data-split className="text-5xl tracking-[-0.01em] sm:text-6xl">{title}</h1>
      </header>

      <div data-reveal className="flex flex-col gap-5 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by category">
          <ul className="flex flex-wrap gap-2">
            {chips.map((c) => {
              const active = (category?.slug ?? '') === c.slug;
              return (
                <li key={c.slug || 'all'}>
                  <Link
                    to={`/shop${c.slug ? `/${c.slug}` : ''}${suffix}`}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm transition ${
                      active
                        ? 'border-espresso bg-espresso text-ivory shadow-lift'
                        : 'border-line bg-white text-espresso hover:-translate-y-0.5 hover:border-champagne'
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-64">
            <label htmlFor={searchId} className="field-label sr-only">
              Search products
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-cocoa" />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => updateParam('q', e.target.value)}
                placeholder="Search products"
                className="field-input pl-11"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor={sortId} className="shrink-0 text-sm text-cocoa">
              Sort by
            </label>
            <select
              id={sortId}
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value, 'featured')}
              className="field-input w-full py-0 sm:w-48"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-cocoa" aria-live="polite" role="status">
        {results.length} {results.length === 1 ? 'product' : 'products'}
        {query.trim() && <> matching “{query.trim()}”</>}
      </p>

      {results.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p) => (
            <li key={p.slug} data-reveal>
              <ProductCard product={p} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-line bg-white px-6 py-14 text-center">
          <p className="font-serif text-2xl">No products found</p>
          <p className="mt-2 text-cocoa">
            {query.trim()
              ? `Nothing matches “${query.trim()}”${category ? ` in ${category.name}` : ''}. Try a different word or browse all products.`
              : 'There are no products in this category yet.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {query.trim() && (
              <button type="button" className="btn-outline" onClick={() => updateParam('q', '')}>
                Clear search
              </button>
            )}
            <Link to="/shop" className="btn-primary">
              View all products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
