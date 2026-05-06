import type { ProductSize } from '../types/product.types';

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'featured';

interface ProductFiltersProps {
  sizes?: ProductSize[];
  selectedSize: ProductSize | null;
  onSizeChange: (size: ProductSize | null) => void;
  selectedSort: SortOption | undefined;
  onSortChange: (sort: SortOption | undefined) => void;
}

const ALL_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function ProductFilters({
  sizes = ALL_SIZES,
  selectedSize,
  onSizeChange,
  selectedSort,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="product-filters">
      <div className="product-filters__sizes">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={`size-btn${selectedSize === size ? ' size-btn--active' : ''}`}
            onClick={() => onSizeChange(selectedSize === size ? null : size)}
            aria-pressed={selectedSize === size}
          >
            {size}
          </button>
        ))}
      </div>
      <select
        className="product-filters__sort"
        aria-label="Ordenar por"
        value={selectedSort ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onSortChange(val === '' ? undefined : (val as SortOption));
        }}
      >
        <option value="">Ordenar</option>
        <option value="featured">Destacados</option>
        <option value="newest">Más nuevos</option>
        <option value="price_asc">Precio: menor a mayor</option>
        <option value="price_desc">Precio: mayor a menor</option>
      </select>
    </div>
  );
}
