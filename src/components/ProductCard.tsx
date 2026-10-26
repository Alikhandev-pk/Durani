import { Link } from 'react-router-dom';
import { getCategory, isPurchasable, type Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { ArrowRightIcon } from './Icons';
import { Price } from './Price';
import { ProductStage } from './ProductStage';

export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 }) {
  const { addItem } = useCart();
  const category = getCategory(product.category);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const purchasable = isPurchasable(product);

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[1.75rem] ring-1 ring-line/60 transition duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-1.5 group-hover:shadow-lift">
        {/* Posters sit below the category label so no artwork is covered. */}
        <ProductStage product={product} className="aspect-[4/5]" posterPadding="px-[5%] pt-[13%] pb-[4%]" />
        {/* Light sweep on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.55)_50%,transparent_70%)] transition-transform duration-1000 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:translate-x-full"
        />
        {category && (
          <span className="glass absolute top-3 left-3 rounded-full px-3 py-1 text-[0.62rem] font-medium tracking-[0.2em] text-gold-deep uppercase">
            {category.name}
          </span>
        )}
        {/* Hover bar; left out over posters, where it would cover label text. */}
        {product.cutout && (
          <span
            aria-hidden="true"
            className="absolute inset-x-3 bottom-3 hidden translate-y-[140%] items-center justify-center gap-2 rounded-full bg-espresso/90 py-3 text-[0.7rem] font-medium tracking-[0.16em] text-ivory uppercase backdrop-blur transition duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:translate-y-0 sm:flex"
          >
            View product <ArrowRightIcon width={14} height={14} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <Heading className="font-serif text-base leading-snug sm:text-lg">
          {/* Stretched link: the whole card is clickable with a single tab stop. */}
          <Link
            to={`/product/${product.slug}`}
            className="rounded-2xl transition-colors after:absolute after:inset-0 after:rounded-[1.75rem] after:content-[''] group-hover:text-gold-deep focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-gold-deep"
          >
            {product.name}
          </Link>
        </Heading>
        {product.size && <p className="mt-1 text-sm text-cocoa">{product.size}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <Price price={product.price} />
          {purchasable && (
            <button
              type="button"
              onClick={() => addItem(product.slug, 1)}
              className="relative z-10 text-xs font-medium tracking-[0.12em] text-gold-deep uppercase link-underline"
            >
              Add to cart<span className="sr-only">: {product.name}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
