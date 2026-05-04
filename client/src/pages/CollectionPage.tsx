import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productsService } from '../services/products.service';
import type { Product, ProductCategory } from '../types/product.types';
import './CollectionPage.css';

const CATEGORY_LABELS: Record<string, string> = {
  bikini: 'Bikinis',
  completo: 'Completos',
  trikini: 'Trikinis',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

function ProductCardSkeleton() {
  return (
    <div className="coll-card coll-card--skeleton">
      <div className="coll-card__image skeleton" />
      <div className="coll-card__body">
        <div className="skeleton" style={{ height: 12, width: '50%', borderRadius: 2 }} />
        <div className="skeleton" style={{ height: 18, width: '80%', borderRadius: 2 }} />
        <div className="skeleton" style={{ height: 14, width: '35%', borderRadius: 2 }} />
      </div>
    </div>
  );
}

export function CollectionPage() {
  const { category } = useParams<{ category?: ProductCategory }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const title = category ? (CATEGORY_LABELS[category] ?? category) : 'Toda la colección';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetch = category
      ? productsService.getByCategory(category)
      : productsService.getAll().then((r) => r.products);

    fetch
      .then((data) => { if (!cancelled) setProducts(Array.isArray(data) ? data : []); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [category]);

  return (
    <div className="coll-page">
      {/* Header */}
      <section className="coll-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="eyebrow">Resort 2026</span>
            <h1 className="section-title" style={{ marginTop: '0.5rem' }}>{title}</h1>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>
              {loading ? '' : `${products.length} piezas`}
            </p>
          </motion.div>

          {/* Category filters */}
          <div className="coll-filters">
            <Link
              to="/collection"
              className={`coll-filter-btn${!category ? ' coll-filter-btn--active' : ''}`}
            >
              Todo
            </Link>
            {['bikini', 'completo', 'trikini'].map((cat) => (
              <Link
                key={cat}
                to={`/collection/${cat}`}
                className={`coll-filter-btn${category === cat ? ' coll-filter-btn--active' : ''}`}
              >
                {CATEGORY_LABELS[cat]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="coll-grid-section">
        <div className="container">
          <div className="coll-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <Link to={`/product/${product.slug}`} className="coll-card">
                      <div className="coll-card__image-wrap">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="coll-card__image"
                          loading="lazy"
                        />
                        {product.compareAtPrice && (
                          <span className="coll-card__badge">Sale</span>
                        )}
                        {product.isFeatured && !product.compareAtPrice && (
                          <span className="coll-card__badge coll-card__badge--feature">Destacado</span>
                        )}
                      </div>
                      <div className="coll-card__body">
                        <p className="coll-card__category">{CATEGORY_LABELS[product.category]}</p>
                        <p className="coll-card__name">{product.name}</p>
                        <div className="coll-card__price-row">
                          <span className="coll-card__price">{fmt(product.price)}</span>
                          {product.compareAtPrice && (
                            <span className="coll-card__compare">{fmt(product.compareAtPrice)}</span>
                          )}
                        </div>
                        <div className="coll-card__colors">
                          {product.colors.slice(0, 4).map((c) => (
                            <span
                              key={c.name}
                              className="coll-card__color-dot"
                              style={{ background: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>

          {!loading && products.length === 0 && (
            <div className="coll-empty">
              <p>No hay piezas en esta categoría todavía.</p>
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
