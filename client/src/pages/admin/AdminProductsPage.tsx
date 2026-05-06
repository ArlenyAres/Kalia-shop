import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, ImageOff, Plus, Trash2 } from 'lucide-react';
import {
  deleteProduct,
  getProducts,
  updateProduct,
} from '../../services/admin.service';
import type { Product } from '../../types/product.types';
import './AdminProductsPage.css';

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function totalStock(product: Product): number {
  return (product.stock ?? []).reduce((sum, v) => sum + v.quantity, 0);
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { isActive: !product.isActive });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      showToast('Error al actualizar el producto', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast('Producto eliminado', 'success');
    } catch {
      showToast('Error al eliminar el producto', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <h1 className="admin-products__title">Productos</h1>
        <Link to="/admin/productos/nuevo" className="admin-products__btn-new">
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>

      <input
        type="search"
        className="admin-products__search"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="admin-products__table-wrap">
        <table className="admin-products__table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="admin-products__skeleton-row">
                    <td><div className="admin-products__skel" style={{ width: 40, height: 50 }} /></td>
                    <td><div className="admin-products__skel" style={{ width: 160 }} /></td>
                    <td><div className="admin-products__skel" style={{ width: 70 }} /></td>
                    <td><div className="admin-products__skel" style={{ width: 60 }} /></td>
                    <td><div className="admin-products__skel" style={{ width: 40 }} /></td>
                    <td><div className="admin-products__skel" style={{ width: 60 }} /></td>
                    <td><div className="admin-products__skel" style={{ width: 60 }} /></td>
                  </tr>
                ))
              : filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.images[0] ? (
                        <img
                          className="admin-products__thumb"
                          src={product.images[0]}
                          alt={product.name}
                        />
                      ) : (
                        <div className="admin-products__thumb-placeholder">
                          <ImageOff size={16} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="admin-products__name">{product.name}</div>
                      <div className="admin-products__slug">{product.slug}</div>
                    </td>
                    <td>
                      <span className="admin-products__cat-badge">{product.category}</span>
                    </td>
                    <td className="admin-products__price">{formatPrice(product.price)}</td>
                    <td className="admin-products__stock">{totalStock(product)}</td>
                    <td>
                      <button
                        className={`admin-products__toggle admin-products__toggle--${product.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(product)}
                      >
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td>
                      <div className="admin-products__actions">
                        <Link
                          to={`/admin/productos/${product.id}`}
                          className="admin-products__action-btn"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          className="admin-products__action-btn admin-products__action-btn--delete"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Confirm delete modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal__title">Eliminar producto</h2>
            <p className="admin-modal__body">
              ¿Estás seguro de que quieres eliminar{' '}
              <strong>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="admin-modal__actions">
              <button
                className="admin-modal__btn admin-modal__btn--cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button className="admin-modal__btn admin-modal__btn--confirm" onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
