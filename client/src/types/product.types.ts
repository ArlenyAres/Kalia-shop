export type ProductCategory = 'bikini' | 'completo' | 'trikini';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ProductColor {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface StockByVariant {
  size: ProductSize;
  colorName: string;
  quantity: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  colors: ProductColor[];
  availableSizes: ProductSize[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  careInstructions: string;
  composition: string;
  stock?: StockByVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: ProductCategory;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
  tags?: string;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
