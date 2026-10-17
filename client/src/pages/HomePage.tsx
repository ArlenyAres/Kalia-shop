import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { productsService } from '../services/products.service';
import type { Product } from '../types/product.types';

const CATEGORY_LABELS: Record<string, string> = {
  bikini: 'Bikini',
  completo: 'Completo',
  trikini: 'Trikini',
};

export function HomePage() {
  const { format } = useCurrency();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    productsService.getFeatured().then((data) => {
      if (!cancelled) setFeatured(data.slice(0, 6));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <article className="hero-card">
            <div className="hero-copy">
              <span className="eyebrow">
                <Sparkles size={14} />
                Atelier de trajes de baño
              </span>
              <h1 className="title-display">Siluetas resort con un brillo sereno de sol.</h1>
              <p>
                Kalia selecciona bikinis, completos y trikinis con cortes depurados, tejidos
                esculpidores y una paleta cálida de inspiración mediterránea.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" to="/collection">
                  Ver colección
                  <ArrowRight size={18} />
                </Link>
                <Link className="btn btn-secondary" to="/collection/trikini">
                  Nuevos trikinis
                </Link>
              </div>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>48h</strong>
                <p>Envío exprés en piezas destacadas</p>
              </div>
              <div className="hero-stat">
                <strong>24</strong>
                <p>Piezas en la colección Resort 2026</p>
              </div>
              <div className="hero-stat">
                <strong>XS-XXL</strong>
                <p>Tallaje inclusivo en toda la colección</p>
              </div>
            </div>
          </article>
          <div className="hero-stack">
            <article className="panel panel-art" />
            <article className="panel">
              <span className="eyebrow">Nota editorial</span>
              <h3>Para terrazas de hotel, calas escondidas y despedidas a la hora dorada.</h3>
              <p className="text-muted">
                Tejidos reciclados, forro UV y acabados pensados para durar más de una temporada.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <div>
            <span className="eyebrow">Categorías</span>
            <h2 className="section-title">Bikinis, completos y trikinis para cada tipo de día de playa.</h2>
          </div>
          <p className="text-muted">
            Cada pieza se diseña con soporte real, ajuste regulable y colores que no se apagan con el
            sol ni el cloro.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split-grid" style={{ alignItems: 'end', marginBottom: '1.5rem' }}>
            <div>
              <span className="eyebrow">Destacados</span>
              <h2 className="section-title">Lo más vendido</h2>
            </div>
            <p className="text-muted">
              Las piezas que más se repiten en las maletas de nuestras clientas esta temporada.
            </p>
          </div>
          <div className="products-grid">
            {featured.map((product) => (
              <Link to={`/product/${product.slug}`} className="product-card" key={product.id}>
                <div
                  className="product-card-image"
                  role="img"
                  aria-label={product.name}
                  style={{ backgroundImage: `url(${product.images[0]})` }}
                />
                <div className="product-card-body">
                  <div>
                    <p className="eyebrow">{CATEGORY_LABELS[product.category]}</p>
                    <h3>{product.name}</h3>
                  </div>
                  <div className="price-row">
                    <strong>{format(product.price)}</strong>
                    {product.compareAtPrice && <span>{format(product.compareAtPrice)}</span>}
                  </div>
                  <div className="chip-row">
                    {product.tags.slice(0, 3).map((tag) => (
                      <span className="chip" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container info-grid">
          <article className="info-card">
            <span className="eyebrow">Pago seguro</span>
            <h3>Tarjeta o PayPal</h3>
            <p className="text-muted">Paga en USD o EUR con los métodos que ya usas.</p>
          </article>
          <article className="info-card">
            <span className="eyebrow">Tallas</span>
            <h3>Stock por talla y color</h3>
            <p className="text-muted">Ves la disponibilidad real de cada combinación antes de comprar.</p>
          </article>
          <article className="info-card">
            <span className="eyebrow">Envíos</span>
            <h3>Compra sin registro</h3>
            <p className="text-muted">Compra como invitada y sigue tu pedido con número de seguimiento.</p>
          </article>
        </div>
      </section>
    </>
  );
}
