import { ShoppingBag, X, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const navLinks = [
  { label: 'BIKINIS', to: '/collection/bikini' },
  { label: 'COMPLETOS', to: '/collection/completo' },
  { label: 'TRIKINIS', to: '/collection/trikini' },
  { label: 'ABOUT', to: '/about' },
];

export function Navbar() {
  const { itemCount, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Observe the hero sentinel — if it's not visible we switch to solid
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) {
      setScrolled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    sentinelRef.current = sentinel as HTMLDivElement;
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navbarClass = ['navbar', scrolled ? 'navbar--scrolled' : 'navbar--transparent'].join(' ');

  return (
    <>
      <header className={navbarClass} role="banner">
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo" aria-label="Kalia — inicio">
            KALIA
          </Link>

          <nav aria-label="Navegación principal">
            <ul className="navbar__nav">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    data-active={undefined}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar__actions">
            <button
              className="navbar__cart"
              onClick={openDrawer}
              aria-label={`Carrito, ${itemCount} artículos`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="navbar__badge" aria-hidden="true">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menú móvil">
          <div
            className="mobile-menu__overlay"
            onClick={() => setMenuOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
          <nav className="mobile-menu__panel">
            <button
              className="mobile-menu__close"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            <ul className="mobile-menu__nav">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
