import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const featuredProducts = [
  {
    name: 'Aurelia Set',
    category: 'Bikini',
    price: '$145',
    compareAtPrice: '$180',
    image:
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80',
    tags: ['UV lining', 'Luxe texture', 'Best seller'],
  },
  {
    name: 'Selene One-Piece',
    category: 'Completo',
    price: '$168',
    compareAtPrice: '$210',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    tags: ['Shape support', 'Sculpt fit', 'New drop'],
  },
  {
    name: 'Isola Trikini',
    category: 'Trikini',
    price: '$182',
    compareAtPrice: '$228',
    image:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80',
    tags: ['Limited color', 'Soft matte', 'Exclusive'],
  },
];

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <article className="hero-card">
            <div className="hero-copy">
              <span className="eyebrow">
                <Sparkles size={14} />
                Luxury swimwear atelier
              </span>
              <h1 className="title-display">Resort silhouettes with a quiet, sunlit edge.</h1>
              <p>
                Kalia curates elevated bikinis, completos, and statement trikinis with refined cuts,
                sculpting fabrics, and warm Mediterranean color stories.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" to="/collection">
                  Explore collection
                  <ArrowRight size={18} />
                </Link>
                <Link className="btn btn-secondary" to="/checkout">
                  Start checkout flow
                </Link>
              </div>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>48h</strong>
                <p>Express dispatch on featured drops</p>
              </div>
              <div className="hero-stat">
                <strong>12</strong>
                <p>Signature shades inspired by coastlines</p>
              </div>
              <div className="hero-stat">
                <strong>XS-XL</strong>
                <p>Inclusive sizing with fit-led stock tracking</p>
              </div>
            </div>
          </article>
          <div className="hero-stack">
            <article className="panel panel-art" />
            <article className="panel">
              <span className="eyebrow">Editorial note</span>
              <h3>Made for hotel terraces, hidden coves, and golden hour departures.</h3>
              <p className="text-muted">
                The storefront is ready for product discovery, cart, checkout, and backend order flows.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <div>
            <span className="eyebrow">Signature categories</span>
            <h2 className="section-title">A modular storefront for premium collections.</h2>
          </div>
          <p className="text-muted">
            The client is prepared with React Router, design tokens, service folders, and commerce-ready
            dependencies including PayPal, Stripe, forms, motion, and notifications.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split-grid" style={{ alignItems: 'end', marginBottom: '1.5rem' }}>
            <div>
              <span className="eyebrow">Featured pieces</span>
              <h2 className="section-title">Launch assortment</h2>
            </div>
            <p className="text-muted">
              Sample content is in place so you can connect real inventory from Prisma without redesigning.
            </p>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <article className="product-card" key={product.name}>
                <div className="product-card-image" style={{ backgroundImage: `url(${product.image})` }} />
                <div className="product-card-body">
                  <div>
                    <p className="eyebrow">{product.category}</p>
                    <h3>{product.name}</h3>
                  </div>
                  <div className="price-row">
                    <strong>{product.price}</strong>
                    <span>{product.compareAtPrice}</span>
                  </div>
                  <div className="chip-row">
                    {product.tags.map((tag) => (
                      <span className="chip" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container info-grid">
          <article className="info-card">
            <span className="eyebrow">Payments</span>
            <h3>Stripe and PayPal ready</h3>
            <p className="text-muted">Dependencies and env placeholders are included for both flows.</p>
          </article>
          <article className="info-card">
            <span className="eyebrow">Inventory</span>
            <h3>Variant-level stock</h3>
            <p className="text-muted">Products connect to stock by size, color, and unique SKU in Prisma.</p>
          </article>
          <article className="info-card">
            <span className="eyebrow">Orders</span>
            <h3>Guest and tracked checkout</h3>
            <p className="text-muted">Order models support payment state, shipping address, and fulfillment notes.</p>
          </article>
        </div>
      </section>
    </>
  );
}
