import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Package, ShoppingBag } from 'lucide-react';
import './AdminLayout.css';

export function AdminLayout() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('kalia_admin') ?? 'Admin';

  const logout = () => {
    localStorage.removeItem('kalia_token');
    localStorage.removeItem('kalia_admin');
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <span className="admin-sidebar__logo">KALIA</span>
          <span className="admin-sidebar__admin-label">Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/productos"
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
            }
          >
            <Package size={18} />
            Productos
          </NavLink>

          <NavLink
            to="/admin/pedidos"
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
            }
          >
            <ShoppingBag size={18} />
            Pedidos
          </NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          <button className="admin-sidebar__link admin-sidebar__link--logout" onClick={logout}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="admin-body">
        <header className="admin-topbar">
          <span className="admin-topbar__name">{adminName}</span>
          <button className="admin-topbar__logout" onClick={logout} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
