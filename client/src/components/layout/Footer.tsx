import { Link } from 'react-router-dom';
import './Footer.css';

const navLinks = [
  { label: 'Nueva Colección', to: '/collection' },
  { label: 'Bikinis', to: '/collection/bikini' },
  { label: 'Completos', to: '/collection/completo' },
  { label: 'Trikinis', to: '/collection/trikini' },
];

const categories = [
  { label: 'Best Sellers', to: '/collection?sort=featured' },
  { label: 'Nuevas llegadas', to: '/collection?sort=newest' },
  { label: 'Sobre Kalia', to: '/about' },
  { label: 'Cuidado de telas', to: '/care' },
];

const paymentMethods = ['VISA', 'MC', 'AMEX', 'PayPal', 'Stripe'];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Brand */}
          <div>
            <Link to="/" className="footer__brand-logo" aria-label="Kalia — inicio">
              KALIA
            </Link>
            <p className="footer__tagline">
              Luxury swimwear for warm light, calm water, and long summers. Crafted with refined
              cuts and warm Mediterranean color stories.
            </p>
            <div className="footer__social">
              <a
                href="https://instagram.com"
                className="footer__social-link"
                aria-label="Instagram"
                rel="noreferrer noopener"
                target="_blank"
              >
                IG
              </a>
              <a
                href="https://tiktok.com"
                className="footer__social-link"
                aria-label="TikTok"
                rel="noreferrer noopener"
                target="_blank"
              >
                TK
              </a>
              <a
                href="https://pinterest.com"
                className="footer__social-link"
                aria-label="Pinterest"
                rel="noreferrer noopener"
                target="_blank"
              >
                PT
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="footer__col-title">Navegación</p>
            <ul className="footer__links">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="footer__col-title">Colecciones</p>
            <ul className="footer__links">
              {categories.map((cat) => (
                <li key={cat.to}>
                  <Link to={cat.to}>{cat.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="footer__col-title">Contacto</p>
            <div className="footer__contact">
              <span className="footer__contact-item">hello@kalia.shop</span>
              <span className="footer__contact-item">Resort 2026</span>
              <span className="footer__contact-item">Envíos mundiales</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">© {new Date().getFullYear()} Kalia. Todos los derechos reservados.</p>
          <div className="footer__payments" aria-label="Métodos de pago aceptados">
            {paymentMethods.map((m) => (
              <span key={m} className="footer__payment-icon">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
