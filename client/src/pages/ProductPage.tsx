import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { productsService } from '../services/products.service';
import type { Product, ProductSize } from '../types/product.types';
import { CATEGORY_LABELS, CATEGORY_LABELS_SINGULAR, cartSku, isVariantAvailable } from '../utils/catalog';
import './ProductPage.css';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, openDrawer } = useCart();
  const { format: fmt } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    // Al navegar entre productos no debe quedar el estado del anterior.
    setLoading(true);
    setNotFound(false);
    setSelectedImage(0);
    productsService
      .getBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          const color = data.colors[0]?.name ?? null;
          setSelectedColor(color);
          // Preselecciona la primera talla con stock para ese color.
          const size = color ? data.availableSizes.find((s) => isVariantAvailable(data, s, color)) : undefined;
          setSelectedSize(size ?? null);
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const selectionAvailable =
    !!product && !!selectedSize && !!selectedColor && isVariantAvailable(product, selectedSize, selectedColor);

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    if (product && selectedSize && !isVariantAvailable(product, selectedSize, color)) {
      setSelectedSize(product.availableSizes.find((s) => isVariantAvailable(product, s, color)) ?? null);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor || !selectionAvailable) return;
    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images[0] ?? '',
      slug: product.slug,
      color: selectedColor,
      size: selectedSize,
      sku: cartSku(product.id, selectedSize, selectedColor),
      price: product.price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openDrawer();
  };

  if (loading) {
    return (
      <div className="prod-page">
        <div className="container prod-layout">
          <div className="prod-gallery">
            <div className="prod-main-image skeleton" />
          </div>
          <div className="prod-info">
            <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 2 }} />
            <div className="skeleton" style={{ height: 36, width: '75%', borderRadius: 2, marginTop: 8 }} />
            <div className="skeleton" style={{ height: 24, width: '25%', borderRadius: 2, marginTop: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="prod-page">
        <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
          <p className="text-muted">Producto no encontrado.</p>
          <Link to="/collection" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <Button variant="secondary" size="sm">← Volver a la colección</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="prod-page">
      <div className="container">
        <Link to={`/collection/${product.category}`} className="prod-back">
          <ArrowLeft size={14} /> Volver a {CATEGORY_LABELS[product.category]}
        </Link>

        <div className="prod-layout">
          {/* Gallery */}
          <motion.div
            className="prod-gallery"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="prod-main-image">
              <img src={product.images[selectedImage]} alt={product.name} />
            </div>
            {product.images.length > 1 && (
              <div className="prod-thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`prod-thumb${selectedImage === i ? ' prod-thumb--active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-pressed={selectedImage === i}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            className="prod-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="eyebrow">{CATEGORY_LABELS_SINGULAR[product.category]}</span>
            <h1 className="prod-name">{product.name}</h1>

            <div className="prod-price-row">
              <span className="prod-price">{fmt(product.price)}</span>
              {product.compareAtPrice && (
                <span className="prod-compare">{fmt(product.compareAtPrice)}</span>
              )}
            </div>

            <p className="prod-short-desc">{product.shortDescription}</p>

            {/* Colors */}
            <div className="prod-option">
              <p className="prod-option__label">
                Color: <strong>{selectedColor}</strong>
              </p>
              <div className="prod-colors">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    className={`prod-color-btn${selectedColor === c.name ? ' prod-color-btn--active' : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => handleSelectColor(c.name)}
                    aria-label={c.name}
                    aria-pressed={selectedColor === c.name}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="prod-option">
              <p className="prod-option__label">Talla</p>
              <div className="prod-sizes">
                {product.availableSizes.map((size) => {
                  const available = !selectedColor || isVariantAvailable(product, size, selectedColor);
                  return (
                    <button
                      key={size}
                      className={`prod-size-btn${selectedSize === size ? ' prod-size-btn--active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      disabled={!available}
                      aria-label={available ? `Talla ${size}` : `Talla ${size}, agotada`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="cta"
              size="lg"
              className="prod-add-btn"
              onClick={handleAddToCart}
              disabled={!selectionAvailable}
            >
              <ShoppingBag size={16} />
              {added ? '¡Añadido!' : selectionAvailable ? 'Añadir al carrito' : 'Agotado en este color'}
            </Button>

            {/* Details */}
            <div className="prod-details">
              <details className="prod-accordion">
                <summary>Descripción</summary>
                <p>{product.description}</p>
              </details>
              <details className="prod-accordion">
                <summary>Composición</summary>
                <p>{product.composition}</p>
              </details>
              <details className="prod-accordion">
                <summary>Cuidado</summary>
                <p>{product.careInstructions}</p>
              </details>
            </div>

            {/* Tags */}
            <div className="prod-tags">
              {product.tags.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
