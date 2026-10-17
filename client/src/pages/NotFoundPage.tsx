import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page-card" style={{ marginTop: '3rem' }}>
      <span className="eyebrow">404</span>
      <h1 className="section-title">Página no encontrada</h1>
      <p className="text-muted">La página que buscas no existe o se ha movido.</p>
      <div style={{ marginTop: '1rem' }}>
        <Link className="btn btn-primary" to="/">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
