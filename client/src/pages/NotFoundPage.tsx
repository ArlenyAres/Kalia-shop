import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page-card" style={{ marginTop: '3rem' }}>
      <span className="eyebrow">404</span>
      <h1 className="section-title">Page not found</h1>
      <p className="text-muted">The route does not exist yet, but the storefront shell is working.</p>
      <div style={{ marginTop: '1rem' }}>
        <Link className="btn btn-primary" to="/">
          Back home
        </Link>
      </div>
    </section>
  );
}
