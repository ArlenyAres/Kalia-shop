import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { productsService } from '../services/products.service';
import type { Product } from '../types/product.types';
import './Home.css';

const CATEGORIES = [
  {
    label: 'Bikinis',
    to: '/collection/bikini',
    image:
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Completos',
    to: '/collection/completo',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Trikinis',
    to: '/collection/trikini',
    image:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] } }),
};

function ProductSkeleton() {
  return (
    <div className="home-product-skeleton">
      <div className="home-product-skeleton__image skeleton" />
      <div className="home-product-skeleton__line skeleton" style={{ width: '55%' }} />
      <div className="home-product-skeleton__line skeleton" style={{ width: '75%' }} />
      <div className="home-product-skeleton__line skeleton" style={{ width: '35%' }} />
    </div>
  );
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    productsService
      .getFeatured()
      .then((data) => { if (!cancelled && Array.isArray(data)) setFeatured(data); })
      .catch(() => { /* silent: no featured products */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* Sentinel element for Navbar IntersectionObserver */}
      <div id="hero-sentinel" style={{ position: 'absolute', top: 0, height: 1 }} aria-hidden="true" />

      {/* ── Hero ── */}
      <section className="home-hero" aria-label="Hero">
        <div className="home-hero__bg" aria-hidden="true" />
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">
            <Sparkles size={12} />
            Resort 2026 · Luxury swimwear atelier
          </p>
          <h1 className="home-hero__title">KALIA</h1>
          <p className="home-hero__tagline">
            Elevated bikinis, completos, and statement trikinis with refined cuts, sculpting fabrics,
            and warm Mediterranean color stories.
          </p>
          <div className="home-hero__actions">
            <Link to="/collection">
              <Button variant="cta" size="lg">
                Explorar colección
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/collection/bikini">
              <Button
                variant="ghost"
                size="lg"
                style={{ borderColor: 'rgba(250,249,246,0.3)', color: 'var(--kalia-white)' }}
              >
                Ver bikinis
              </Button>
            </Link>
          </div>
        </div>
        <div className="home-hero__scroll" aria-hidden="true">
          <span>Scroll</span>
          <span className="home-hero__scroll-line" />
          <ArrowDown size={12} />
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="home-categories" aria-label="Categorías">
        <div className="home-categories__inner">
          <motion.div
            className="home-categories__header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <span className="eyebrow">Colecciones</span>
            <h2 className="section-title">Encuentra tu silueta</h2>
          </motion.div>

          <div className="home-categories__grid">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.to}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                custom={i * 0.1}
              >
                <Link to={cat.to} className="category-card" aria-label={`Ver ${cat.label}`}>
                  <div
                    className="category-card__image"
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                  <div className="category-card__overlay">
                    <p className="category-card__label">{cat.label}</p>
                    <p className="category-card__cta">Ver colección →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ── */}
      {(loading || featured.length > 0) && (
        <section className="home-featured" aria-label="Productos destacados">
          <div className="home-featured__inner">
            <motion.div
              className="home-featured__header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              custom={0}
            >
              <div>
                <span className="eyebrow">
                  <Sparkles size={12} />
                  Selección editorial
                </span>
                <h2 className="section-title">Piezas destacadas</h2>
              </div>
              <Link to="/collection?sort=featured">
                <Button variant="ghost" size="sm">
                  Ver todo
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </motion.div>

            <div className="home-products-grid">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <ProductSkeleton key={i} />)
                : featured.slice(0, 3).map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-40px' }}
                      variants={fadeUp}
                      custom={i * 0.1}
                    >
                      <Link to={`/product/${product.slug}`} className="home-product-card">
                        <div className="home-product-card__image">
                          <img
                            src={product.images[0] ?? 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=600&q=80'}
                            alt={product.name}
                            loading="lazy"
                          />
                        </div>
                        <p className="home-product-card__category">{product.category}</p>
                        <p className="home-product-card__name">{product.name}</p>
                        <p>
                          <span className="home-product-card__price">{fmt(product.price)}</span>
                          {product.compareAtPrice && (
                            <span className="home-product-card__compare">
                              {fmt(product.compareAtPrice)}
                            </span>
                          )}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand story ── */}
      <motion.section
        className="home-story"
        aria-label="Sobre Kalia"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeUp}
        custom={0}
      >
        <div className="home-story__inner">
          <div className="home-story__image">
            <img
              src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80"
              alt="Modelo en la playa con traje de baño Kalia"
              loading="lazy"
            />
          </div>
          <motion.div
            className="home-story__content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0.15}
          >
            <span className="eyebrow">Nuestra historia</span>
            <h2 className="home-story__title">
              Diseñado para costas remotas y tardes de hotel
            </h2>
            <p className="home-story__body">
              Kalia nació del deseo de crear trajes de baño que trasciendan la temporada — piezas
              hechas con tejidos de alta tecnología, cortes que esculpen, y una paleta de colores
              inspirada en el Mediterráneo y el Caribe.
            </p>
            <p className="home-story__body">
              Cada pieza pasa por un control de calidad riguroso para garantizar resistencia al
              cloro, la sal y el sol, manteniendo su forma colección tras colección.
            </p>
            <Link to="/about">
              <Button variant="secondary" size="md">
                Conoce Kalia
                <ArrowRight size={15} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}
