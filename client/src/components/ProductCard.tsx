import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import type { Product, ProductSize } from '../types/product.types';
import { CATEGORY_LABELS, cartSku, isVariantAvailable } from '../utils/catalog';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const { format: fmt } = useCurrency();

  const defaultColor = product.colors[0]?.name ?? '';

  const handleQuickAdd = (size: ProductSize) => {
    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images[0] ?? '',
      slug: product.slug,
      color: defaultColor,
      size,
      sku: cartSku(product.id, size, defaultColor),
      price: product.price,
      quantity: 1,
    });
    openDrawer();
  };

  return (
    <article className="coll-card">
      <Link to={`/product/${product.slug}`} className="coll-card__link-area">
        <div className="coll-card__image-wrap">
          <img src={product.images[0]} alt={product.name} className="coll-card__image" loading="lazy" />
          {product.compareAtPrice && <span className="coll-card__badge">Sale</span>}
          {product.isFeatured && !product.compareAtPrice && (
            <span className="coll-card__badge coll-card__badge--feature">Destacado</span>
          )}
        </div>
        <div className="coll-card__body">
          <p className="coll-card__category">{CATEGORY_LABELS[product.category]}</p>
          <p className="coll-card__name">{product.name}</p>
          <div className="coll-card__price-row">
            <span className="coll-card__price">{fmt(product.price)}</span>
            {product.compareAtPrice && <span className="coll-card__compare">{fmt(product.compareAtPrice)}</span>}
          </div>
          <div className="coll-card__colors">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c.name} className="coll-card__color-dot" style={{ background: c.hex }} title={c.name} />
            ))}
          </div>
        </div>
      </Link>

      {defaultColor && (
        <div className="coll-card__quick-add" role="group" aria-label={`Añadir ${product.name} en ${defaultColor}`}>
          <span className="coll-card__quick-label">Añadir</span>
          {product.availableSizes.map((size) => (
            <button
              key={size}
              type="button"
              disabled={!isVariantAvailable(product, size, defaultColor)}
              onClick={() => handleQuickAdd(size)}
              aria-label={`Añadir ${product.name} talla ${size}`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
