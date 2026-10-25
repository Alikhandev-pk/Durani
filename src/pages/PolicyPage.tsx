import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Notice } from '../components/Notice';
import { policyNav } from '../config/navigation';
import { site } from '../config/site';
import { getPolicy } from '../data/policies';
import { usePageMeta } from '../hooks/usePageMeta';
import { NotFoundPage } from './NotFoundPage';

export function PolicyPage() {
  const { slug } = useParams();
  const policy = getPolicy(slug);
  const isDraft = policy?.status !== 'confirmed';

  usePageMeta({
    title: policy ? `${policy.title}${isDraft ? ' (Draft)' : ''}` : 'Page not found',
    description: policy ? `${policy.title} for ${site.name}.` : undefined,
    noindex: isDraft,
  });

  if (!policy) return <NotFoundPage />;

  return (
    <div className="container-page pt-8 sm:pt-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: policy.title }]} />
      <div className="mt-6 grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <nav aria-label="Policies" className="order-2 lg:order-1">
          <p className="eyebrow mb-3">Policies</p>
          <ul className="space-y-1">
            {policyNav.map((p) => (
              <li key={p.to}>
                <Link
                  to={p.to}
                  aria-current={p.to.endsWith(policy.slug) ? 'page' : undefined}
                  className="inline-flex min-h-10 items-center text-sm hover:text-gold-deep aria-[current=page]:font-medium aria-[current=page]:text-gold-deep"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="order-1 max-w-2xl lg:order-2">
          <h1 className="text-4xl sm:text-5xl">
            {policy.title}
            {isDraft && (
              <span className="ml-3 inline-block translate-y-[-0.4em] rounded-full border border-champagne bg-[#fbf1df] px-3 py-1 align-middle font-sans text-xs tracking-[0.16em] text-gold-deep uppercase">
                Draft
              </span>
            )}
          </h1>
          {isDraft && (
            <Notice title="Draft — not yet confirmed" tone="draft" className="mt-6">
              This policy has not been confirmed by {site.name} and does not form part of any terms of sale. The
              headings below show what the final policy will cover.
            </Notice>
          )}
          <div className="mt-10 space-y-8">
            {policy.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-2xl">{s.heading}</h2>
                <p className={`mt-2 ${isDraft ? 'text-cocoa italic' : 'text-cocoa'}`}>{s.body}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
