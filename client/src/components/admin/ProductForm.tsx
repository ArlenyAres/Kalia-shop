import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload } from 'lucide-react';
import {
  createProduct,
  updateProduct,
  uploadImages,
} from '../../services/admin.service';
import { getProducts } from '../../services/admin.service';
import type { Product, ProductCategory, ProductSize } from '../../types/product.types';
import './ProductForm.css';

const ALL_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES: ProductCategory[] = ['bikini', 'completo', 'trikini'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function buildSku(
  category: ProductCategory | '',
  size: ProductSize,
  colorName: string,
): string {
  const cat = (category || 'PRD').toUpperCase().slice(0, 3);
  const col = colorName.toUpperCase().replace(/\s+/g, '').slice(0, 4);
  return `KAL-${cat}-${size}-${col}`;
}

interface ColorRow {
  id: string;
  name: string;
  hex: string;
  imageUrl: string;
}

interface StockRow {
  size: ProductSize;
  colorName: string;
  quantity: number;
}

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  slug: z.string().min(1, 'Slug requerido'),
  category: z.enum(['bikini', 'completo', 'trikini'], {
    required_error: 'Categoría requerida',
  }),
  price: z.number({ invalid_type_error: 'Precio requerido' }).positive('Debe ser positivo'),
  compareAtPrice: z.number().positive().optional().or(z.literal(0).transform(() => undefined)),
  shortDescription: z.string().max(150, 'Máximo 150 caracteres').optional().default(''),
  description: z.string().optional().default(''),
  composition: z.string().optional().default(''),
  careInstructions: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [colors, setColors] = useState<ColorRow[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>(['XS', 'S', 'M', 'L', 'XL']);
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const nameValue = watch('name');
  const shortDescValue = watch('shortDescription') ?? '';
  const categoryValue = watch('category');

  // Auto-generate slug
  useEffect(() => {
    if (nameValue && !isEdit) {
      setValue('slug', slugify(nameValue));
    }
  }, [nameValue, isEdit, setValue]);

  // Load existing product for edit
  useEffect(() => {
    if (!isEdit || !id) return;
    getProducts().then((list) => {
      const found = list.find((p) => p.id === id);
      if (!found) return;
      setProduct(found);
      setValue('name', found.name);
      setValue('slug', found.slug);
      setValue('category', found.category);
      setValue('price', found.price / 100);
      if (found.compareAtPrice) setValue('compareAtPrice', found.compareAtPrice / 100);
      setValue('shortDescription', found.shortDescription);
      setValue('description', found.description);
      setValue('composition', found.composition);
      setValue('careInstructions', found.careInstructions);
      setIsActive(found.isActive);
      setIsFeatured(found.isFeatured);
      setTags(found.tags);
      setSelectedSizes(found.availableSizes);
      setColors(
        found.colors.map((c, i) => ({
          id: String(i),
          name: c.name,
          hex: c.hex,
          imageUrl: c.imageUrl ?? '',
        })),
      );
      if (found.stock) {
        setStockRows(
          found.stock.map((s) => ({
            size: s.size,
            colorName: s.colorName,
            quantity: s.quantity,
          })),
        );
      }
      setImagePreviews(found.images);
    });
  }, [id, isEdit, setValue]);

  // Rebuild stock rows when sizes or colors change
  useEffect(() => {
    if (isEdit && product && stockRows.length > 0) return; // don't reset on edit after load
    const rows: StockRow[] = [];
    for (const size of selectedSizes) {
      for (const color of colors) {
        if (!color.name) continue;
        const existing = stockRows.find(
          (r) => r.size === size && r.colorName === color.name,
        );
        rows.push({ size, colorName: color.name, quantity: existing?.quantity ?? 0 });
      }
    }
    setStockRows(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSizes, colors]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Image handling
  const addImageFiles = (files: File[]) => {
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews([...(isEdit ? product?.images ?? [] : []), ...previews]);
  };

  const removeImage = (index: number) => {
    if (isEdit && index < (product?.images.length ?? 0)) return; // can't remove server images from here
    const fileIndex = index - (isEdit ? product?.images.length ?? 0 : 0);
    const newFiles = [...imageFiles];
    newFiles.splice(fileIndex, 1);
    setImageFiles(newFiles);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews([...(isEdit ? product?.images ?? [] : []), ...previews]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (files.length) addImageFiles(files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFiles, product]);

  // Colors
  const addColor = () => {
    setColors((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', hex: '#000000', imageUrl: '' },
    ]);
  };

  const updateColor = (id: string, field: keyof ColorRow, value: string) => {
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const removeColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  // Sizes
  const toggleSize = (size: ProductSize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  // Tags
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags((prev) => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  // Submit
  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      category: values.category,
      price: Math.round(values.price * 100),
      compareAtPrice: values.compareAtPrice ? Math.round(values.compareAtPrice * 100) : undefined,
      shortDescription: values.shortDescription ?? '',
      description: values.description ?? '',
      composition: values.composition ?? '',
      careInstructions: values.careInstructions ?? '',
      colors: colors.map((c) => ({ name: c.name, hex: c.hex, imageUrl: c.imageUrl || undefined })),
      availableSizes: selectedSizes,
      tags,
      isActive,
      isFeatured,
      stock: stockRows.map((row) => ({
        ...row,
        sku: buildSku(values.category, row.size, row.colorName),
      })),
    };

    try {
      if (isEdit && id) {
        const updated = await updateProduct(id, payload);
        if (imageFiles.length) {
          await uploadImages(updated.id, imageFiles);
        }
        showToast('Producto actualizado', 'success');
      } else {
        const created = await createProduct(payload);
        if (imageFiles.length) {
          await uploadImages(created.id, imageFiles);
        }
        showToast('Producto creado', 'success');
        setTimeout(() => navigate('/admin/productos'), 1200);
      }
    } catch {
      showToast('Error al guardar el producto', 'error');
    }
  };

  return (
    <form className="pf" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="pf__page-header">
        <h1 className="pf__page-title">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
      </div>

      {/* Basic info */}
      <div className="pf__section">
        <h2 className="pf__section-heading">Información básica</h2>
        <div className="pf__section-body">
          <div className="pf__row">
            <div className="pf__field">
              <label className="pf__label" htmlFor="pf-name">Nombre</label>
              <input
                id="pf-name"
                className={`pf__input${errors.name ? ' pf__input--error' : ''}`}
                {...register('name')}
              />
              {errors.name && <span className="pf__error" role="alert">{errors.name.message}</span>}
            </div>
            <div className="pf__field">
              <label className="pf__label" htmlFor="pf-slug">Slug</label>
              <input
                id="pf-slug"
                className={`pf__input${errors.slug ? ' pf__input--error' : ''}`}
                {...register('slug')}
              />
              {errors.slug && <span className="pf__error" role="alert">{errors.slug.message}</span>}
            </div>
          </div>

          <div className="pf__row pf__row--3">
            <div className="pf__field">
              <label className="pf__label" htmlFor="pf-category">Categoría</label>
              <select
                id="pf-category"
                className={`pf__select${errors.category ? ' pf__select--error' : ''}`}
                {...register('category')}
              >
                <option value="">Seleccionar</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && <span className="pf__error" role="alert">{errors.category.message}</span>}
            </div>

            <div className="pf__field">
              <label className="pf__label" htmlFor="pf-price">
                Precio <span className="pf__label-hint">(€)</span>
              </label>
              <input
                id="pf-price"
                type="number"
                step="0.01"
                min="0"
                className={`pf__input${errors.price ? ' pf__input--error' : ''}`}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <span className="pf__error" role="alert">{errors.price.message}</span>}
            </div>

            <div className="pf__field">
              <label className="pf__label" htmlFor="pf-compare">
                Precio tachado <span className="pf__label-hint">(opcional)</span>
              </label>
              <input
                id="pf-compare"
                type="number"
                step="0.01"
                min="0"
                className="pf__input"
                {...register('compareAtPrice', { setValueAs: (v: string) => (v === '' ? undefined : parseFloat(v)) })}
              />
            </div>
          </div>

          <div className="pf__field pf__field--full">
            <label className="pf__label" htmlFor="pf-short-desc">
              Descripción corta
              <span className="pf__label-hint">(máx. 150)</span>
            </label>
            <textarea
              id="pf-short-desc"
              className={`pf__textarea${errors.shortDescription ? ' pf__textarea--error' : ''}`}
              style={{ minHeight: '70px' }}
              {...register('shortDescription')}
            />
            <span
              className={`pf__char-count${shortDescValue.length > 140 ? ' pf__char-count--warn' : ''}`}
            >
              {shortDescValue.length}/150
            </span>
            {errors.shortDescription && (
              <span className="pf__error" role="alert">{errors.shortDescription.message}</span>
            )}
          </div>

          <div className="pf__field pf__field--full">
            <label className="pf__label" htmlFor="pf-desc">Descripción completa</label>
            <textarea
              id="pf-desc"
              className="pf__textarea"
              {...register('description')}
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="pf__section">
        <h2 className="pf__section-heading">Detalles</h2>
        <div className="pf__section-body">
          <div className="pf__field">
            <label className="pf__label" htmlFor="pf-composition">Composición</label>
            <input
              id="pf-composition"
              className="pf__input"
              placeholder="80% Poliamida · 20% Elastano"
              {...register('composition')}
            />
          </div>
          <div className="pf__field">
            <label className="pf__label" htmlFor="pf-care">Instrucciones de cuidado</label>
            <textarea id="pf-care" className="pf__textarea" {...register('careInstructions')} />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="pf__section">
        <h2 className="pf__section-heading">Imágenes</h2>
        <div className="pf__section-body">
          {!isEdit && (
            <p className="pf__image-note">
              Las imágenes se pueden subir una vez guardado el producto.
            </p>
          )}
          {isEdit && (
            <>
              <div
                className={`pf__dropzone${isDragging ? ' pf__dropzone--drag' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <Upload size={24} />
                <span>Arrastra imágenes aquí o haz clic para seleccionar</span>
                <span className="pf__dropzone-hint">PNG, JPG, WEBP</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) addImageFiles(files);
                }}
              />
              {imagePreviews.length > 0 && (
                <div className="pf__image-grid">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="pf__image-thumb">
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button
                        type="button"
                        className="pf__image-remove"
                        onClick={() => removeImage(i)}
                        title="Eliminar imagen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Colors */}
      <div className="pf__section">
        <h2 className="pf__section-heading">Colores</h2>
        <div className="pf__section-body">
          <div className="pf__color-rows">
            {colors.map((color) => (
              <div key={color.id} className="pf__color-row">
                <input
                  className="pf__input"
                  placeholder="Nombre del color"
                  value={color.name}
                  onChange={(e) => updateColor(color.id, 'name', e.target.value)}
                />
                <input
                  className="pf__color-hex"
                  type="color"
                  value={color.hex}
                  onChange={(e) => updateColor(color.id, 'hex', e.target.value)}
                  title="Seleccionar color"
                />
                <input
                  className="pf__input"
                  placeholder="URL de imagen (opcional)"
                  value={color.imageUrl}
                  onChange={(e) => updateColor(color.id, 'imageUrl', e.target.value)}
                />
                <div
                  className="pf__color-swatch"
                  style={{ background: color.hex }}
                  title={color.hex}
                />
                <button
                  type="button"
                  className="pf__btn-icon"
                  onClick={() => removeColor(color.id)}
                  title="Eliminar color"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="pf__add-btn" onClick={addColor}>
            <Plus size={15} />
            Añadir color
          </button>
        </div>
      </div>

      {/* Sizes */}
      <div className="pf__section">
        <h2 className="pf__section-heading">Tallas</h2>
        <div className="pf__section-body">
          <div className="pf__sizes">
            {ALL_SIZES.map((size) => (
              <label key={size} className="pf__size-label">
                <input
                  type="checkbox"
                  className="pf__size-checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                />
                <span className="pf__size-pill">{size}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Stock table */}
      <div className="pf__section">
        <h2 className="pf__section-heading">Stock por variante</h2>
        {stockRows.length === 0 ? (
          <p className="pf__empty-hint">Añade colores con nombre para configurar el stock por variante.</p>
        ) : (
          <table className="pf__stock-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.map((row, i) => (
                <tr key={`${row.size}-${row.colorName}`}>
                  <td className="pf__stock-sku">
                    {buildSku(categoryValue, row.size, row.colorName)}
                  </td>
                  <td>{row.size}</td>
                  <td>{row.colorName}</td>
                  <td>
                    <input
                      type="number"
                      className="pf__stock-qty"
                      min={0}
                      value={row.quantity}
                      aria-label={`Cantidad ${row.size} ${row.colorName}`}
                      onChange={(e) => {
                        const qty = Number(e.target.value);
                        setStockRows((prev) =>
                          prev.map((r, j) => (j === i ? { ...r, quantity: qty } : r)),
                        );
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Settings */}
      <div className="pf__section">
        <h2 className="pf__section-heading">Configuración</h2>
        <div className="pf__section-body">
          <div className="pf__toggle-row">
            <span className="pf__toggle-label-text">Producto activo</span>
            <label className="pf__switch">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="pf__switch-track" />
            </label>
          </div>
          <div className="pf__toggle-row">
            <span className="pf__toggle-label-text">Producto destacado</span>
            <label className="pf__switch">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <span className="pf__switch-track" />
            </label>
          </div>
          <div className="pf__field" style={{ marginTop: '0.5rem' }}>
            <label className="pf__label">
              Tags <span className="pf__label-hint">(Enter para añadir)</span>
            </label>
            <div className="pf__tags-container" onClick={() => {
              const el = document.getElementById('pf-tag-input');
              el?.focus();
            }}>
              {tags.map((tag) => (
                <span key={tag} className="pf__tag-pill">
                  {tag}
                  <button
                    type="button"
                    className="pf__tag-remove"
                    onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="pf-tag-input"
                className="pf__tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? 'Añadir etiqueta...' : ''}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pf__footer">
        <button
          type="button"
          className="pf__btn-cancel"
          onClick={() => navigate('/admin/productos')}
        >
          Cancelar
        </button>
        <button type="submit" className="pf__btn-save" disabled={isSubmitting}>
          {isSubmitting && <span className="pf__spinner" />}
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {toast && (
        <div className={`pf__toast pf__toast--${toast.type}`}>{toast.message}</div>
      )}
    </form>
  );
}
