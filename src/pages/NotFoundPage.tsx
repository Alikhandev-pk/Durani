import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', noindex: true });
  return (
    <div className="container-page py-20 text-center sm:py-28">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-cocoa">The page you're looking for doesn't exist or may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-outline">
          Go home
        </Link>
        <Link to="/shop" className="btn-primary">
          Shop all products
        </Link>
      </div>
    </div>
  );
}
