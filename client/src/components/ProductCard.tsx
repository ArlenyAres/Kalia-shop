import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/product.types';

interface ProductCardProps {
  product: Product;
}

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

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const defaultSize = product.availableSizes[0] ?? 'S';
  const defaultColor = product.colors[0]?.name ?? '';

  const handleQuickAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images[0] ?? '',
      slug: product.slug,
      color: defaultColor,
      size: defaultSize,
      sku: `${product.id}-${defaultSize}-${defaultColor.replace(/\s/g, '')}`,
      price: product.price,
      quantity: 1,
    });
  };

  return (
    <article className="coll-card">
      <Link to={`/product/${product.slug}`} className="coll-card__link-area">
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
      <button
        type="button"
        className="coll-card__quick-add"
        onClick={handleQuickAdd}
        aria-label={`Añadir ${product.name} al carrito`}
      >
        Añadir
      </button>
    </article>
  );
}
