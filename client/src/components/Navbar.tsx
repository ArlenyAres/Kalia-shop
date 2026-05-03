import { ShoppingBag } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const navigation = [
  { label: 'Nueva coleccion', href: '/' },
  { label: 'Bikinis', href: '/collection/bikini' },
  { label: 'Completos', href: '/collection/completo' },
  { label: 'Trikinis', href: '/collection/trikini' },
];

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link className="nav-brand" to="/">
          Kalia
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink key={item.href} to={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link className="btn btn-secondary" to="/cart">
          <ShoppingBag size={18} />
          Carrito
        </Link>
      </div>
    </header>
  );
}
