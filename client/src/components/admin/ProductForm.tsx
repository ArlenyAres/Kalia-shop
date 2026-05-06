import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import type { ProductCategory, ProductSize } from '../../types/product.types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

interface StockRow {
  size: ProductSize;
  colorName: string;
  quantity: number;
}

interface ProductFormValues {
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  description: string;
  shortDescription: string;
}

interface ProductFormProps {
  initialColors?: string[];
  initialSizes?: ProductSize[];
  onSuccess?: () => void;
}

export function ProductForm({
  initialColors = [],
  initialSizes = ['XS', 'S', 'M', 'L', 'XL'],
  onSuccess,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>();

  const [colors, setColors] = useState<string[]>(initialColors);
  const [sizes] = useState<ProductSize[]>(initialSizes);
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const nameValue = watch('name');

  useEffect(() => {
    if (nameValue) {
      setValue('slug', slugify(nameValue));
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    const rows: StockRow[] = [];
    for (const size of sizes) {
      for (const colorName of colors) {
        rows.push({ size, colorName, quantity: 0 });
      }
    }
    setStockRows(rows);
  }, [sizes, colors]);

  const updateStockQty = (size: ProductSize, colorName: string, quantity: number) => {
    setStockRows((prev) =>
      prev.map((r) =>
        r.size === size && r.colorName === colorName ? { ...r, quantity } : r,
      ),
    );
  };

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      ...values,
      stock: stockRows,
      imageCount: images.length,
    };
    await api.post('/admin/products', payload);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          {...register('name', { required: 'Nombre requerido' })}
        />
        {errors.name && <span role="alert">{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          {...register('slug', { required: 'Slug requerido' })}
          readOnly
        />
      </div>

      <div>
        <label htmlFor="category">Categoría</label>
        <select
          id="category"
          {...register('category', { required: 'Categoría requerida' })}
        >
          <option value="">Seleccionar</option>
          <option value="bikini">Bikini</option>
          <option value="completo">Completo</option>
          <option value="trikini">Trikini</option>
        </select>
        {errors.category && <span role="alert">{errors.category.message}</span>}
      </div>

      <div>
        <label htmlFor="price">Precio</label>
        <input
          id="price"
          type="number"
          {...register('price', { required: 'Precio requerido', valueAsNumber: true })}
        />
        {errors.price && <span role="alert">{errors.price.message}</span>}
      </div>

      <div>
        <label htmlFor="description">Descripción</label>
        <textarea id="description" {...register('description')} />
      </div>

      <div>
        <label htmlFor="shortDescription">Descripción corta</label>
        <input id="shortDescription" {...register('shortDescription')} />
      </div>

      {stockRows.length > 0 && (
        <table aria-label="Stock por variante">
          <thead>
            <tr>
              <th>Talla</th>
              <th>Color</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {stockRows.map((row) => (
              <tr key={`${row.size}-${row.colorName}`}>
                <td>{row.size}</td>
                <td>{row.colorName}</td>
                <td>
                  <input
                    type="number"
                    aria-label={`Cantidad ${row.size} ${row.colorName}`}
                    value={row.quantity}
                    min={0}
                    onChange={(e) =>
                      updateStockQty(row.size, row.colorName, Number(e.target.value))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div>
        <label htmlFor="images">Imágenes</label>
        <input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files ?? []))}
        />
      </div>

      <button type="submit">Guardar producto</button>
    </form>
  );
}
