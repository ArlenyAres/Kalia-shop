import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { Product, ProductCategory } from '../types/product.types';
import { CATEGORIES, CATEGORY_LABELS } from '../utils/catalog';
import './CollectionPage.css';

type SortKey = 'featured' | 'newest' | 'price_asc' | 'price_desc';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Novedades' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
};

function ProductCardSkeleton() {
  return (
    <div className="coll-card coll-card--skeleton" aria-hidden="true">
      <div className="coll-card__image-wrap skeleton" />
      <div className="coll-card__body">
        <div className="skeleton" style={{ height: 12, width: '50%', borderRadius: 2 }} />
        <div className="skeleton" style={{ height: 18, width: '80%', borderRadius: 2 }} />
        <div className="skeleton" style={{ height: 14, width: '35%', borderRadius: 2 }} />
      </div>
    </div>
  );
}

export function CollectionPage() {
  const { category: rawCategory } = useParams<{ category?: string }>();
  const category = CATEGORIES.includes(rawCategory as ProductCategory)
    ? (rawCategory as ProductCategory)
    : undefined;
  const isUnknownCategory = Boolean(rawCategory) && !category;

  const { products, loading, error } = useProducts(category);
  const [sort, setSort] = useState<SortKey>('featured');
  const reduceMotion = useReducedMotion();

  const sorted = useMemo(() => [...products].sort(SORTERS[sort]), [products, sort]);

  const title = category ? CATEGORY_LABELS[category] : 'Toda la colección';
  const empty = !loading && (isUnknownCategory || sorted.length === 0);

  return (
    <div className="coll-page">
      <section className="coll-header">
        <div className="container">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="eyebrow">Resort 2026</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>{title}</h1>
          </motion.div>

          <nav className="coll-filters" aria-label="Categorías">
            <Link
              to="/collection"
              aria-current={!category ? 'page' : undefined}
              className={`coll-filter-btn${!category ? ' coll-filter-btn--active' : ''}`}
            >
              Todo
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/collection/${cat}`}
                aria-current={category === cat ? 'page' : undefined}
                className={`coll-filter-btn${category === cat ? ' coll-filter-btn--active' : ''}`}
              >
                {CATEGORY_LABELS[cat]}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="coll-grid-section">
        <div className="container">
          {!empty && (
            <div className="coll-toolbar">
              <span aria-live="polite">{loading ? 'Cargando…' : `${sorted.length} piezas`}</span>
              <label>
                <span className="sr-only">Ordenar por</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="coll-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : !isUnknownCategory &&
                sorted.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>

          {empty && (
            <div className="coll-empty">
              <p>
                {error
                  ? 'No pudimos cargar la colección. Inténtalo de nuevo en unos segundos.'
                  : isUnknownCategory
                    ? 'Esa categoría no existe.'
                    : 'No hay piezas en esta categoría todavía.'}
              </p>
              <Link to="/collection" className="coll-filter-btn coll-filter-btn--active">
                Ver todo
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
