import { useParams } from 'react-router-dom';

export function ProductPage() {
  const { slug } = useParams();

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Product detail</span>
        <h1 className="section-title">{slug}</h1>
        <p className="text-muted">Use this page for gallery, size selection, stock state, and purchase actions.</p>
      </section>
      <section className="page-card">
        <p>Designed for variant-specific stock, colors JSON, composition, and care instructions.</p>
      </section>
    </>
  );
}
