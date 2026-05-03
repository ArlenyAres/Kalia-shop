import { useParams } from 'react-router-dom';

export function CollectionPage() {
  const { category } = useParams();

  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Collection</span>
        <h1 className="section-title">{category ? `${category} edit` : 'All swimwear'}</h1>
        <p className="text-muted">
          Connect this view to your products endpoint to filter bikinis, completos, and trikinis.
        </p>
      </section>
      <section className="page-card">
        <p>
          This route is wired and ready for data fetching, category filters, sorting, and product cards.
        </p>
      </section>
    </>
  );
}
