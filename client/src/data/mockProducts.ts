import type { Product } from '../types/product.types';

export const MOCK_PRODUCTS: Product[] = [
  // ── BIKINIS ──────────────────────────────────────────────────────────────
  {
    id: 'b1',
    name: 'Aurelia Set',
    slug: 'aurelia-set',
    shortDescription: 'Bandeau superior y bottom triangular de lino reciclado.',
    description:
      'El Aurelia Set redefine el bikini de temporada con un top bandeau de corte recto y un bottom triangular ajustable. Fabricado en lino reciclado con forro UV integrado. La silueta limpia lo convierte en la pieza más fotografiada de la colección Resort 2026.',
    category: 'bikini',
    price: 14500,
    compareAtPrice: 18000,
    images: [
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570194065650-d99fb4b19f7c?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Sage Shore', hex: '#80917d' },
      { name: 'Ebony', hex: '#1a1a18' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['best-seller', 'uv-lining', 'lino-reciclado'],
    isActive: true,
    isFeatured: true,
    careInstructions: 'Lavar a mano con agua fría. No usar secadora.',
    composition: '78% poliamida reciclada · 22% elastano',
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'b2',
    name: 'Nerina Triangle',
    slug: 'nerina-triangle',
    shortDescription: 'Triángulo con tiras finitas ajustables en menta fría.',
    description:
      'El Nerina Triangle es para quien busca el bikini más clásico en el tono más fresco de la temporada. Las tiras son completamente ajustables y el tejido tiene tratamiento anticloro.',
    category: 'bikini',
    price: 12800,
    compareAtPrice: null,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Mint Cove', hex: '#aeba8a' },
      { name: 'Blush', hex: '#e8c4b8' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L'],
    tags: ['nueva-llegada', 'anticloro'],
    isActive: true,
    isFeatured: false,
    careInstructions: 'Enjuagar con agua fría después de cada uso en piscina.',
    composition: '82% poliamida · 18% elastano',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'b3',
    name: 'Capri Bandeau',
    slug: 'capri-bandeau',
    shortDescription: 'Bandeau con aro suave y bottom cheeky en terracota.',
    description:
      'El Capri Bandeau tiene un soporte suave con aro flexible que da definición sin sacrificar comodidad. El bottom cheeky en corte brasileño elonga la silueta. Disponible en terracota Kalia, el color signature de la temporada.',
    category: 'bikini',
    price: 15200,
    compareAtPrice: 19000,
    images: [
      'https://images.unsplash.com/photo-1570194065650-d99fb4b19f7c?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Terracota Kalia', hex: '#ca763b' },
      { name: 'Amber Dune', hex: '#eea83b' },
    ],
    availableSizes: ['S', 'M', 'L', 'XL'],
    tags: ['best-seller', 'aro-suave', 'cheeky'],
    isActive: true,
    isFeatured: true,
    careInstructions: 'Lavar a mano. No planchar.',
    composition: '80% poliamida · 20% elastano',
    createdAt: '2026-01-20T00:00:00.000Z',
    updatedAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'b4',
    name: 'Riviera Halter',
    slug: 'riviera-halter',
    shortDescription: 'Halter con nudo frontal y bottom de tiro alto.',
    description:
      'Inspirado en el Mediterráneo, el Riviera Halter tiene un nudo frontal que aporta textura y el tiro alto del bottom alarga visualmente la pierna. Una pieza atemporal que combina con cualquier pareo.',
    category: 'bikini',
    price: 13600,
    compareAtPrice: null,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Forest Deep', hex: '#134b42' },
      { name: 'Ivory Sand', hex: '#faf9f6' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: ['tiro-alto', 'halter', 'inclusivo'],
    isActive: true,
    isFeatured: false,
    careInstructions: 'Lavar a mano con agua fría.',
    composition: '78% poliamida reciclada · 22% elastano',
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: '2026-02-10T00:00:00.000Z',
  },

  // ── COMPLETOS ─────────────────────────────────────────────────────────────
  {
    id: 'c1',
    name: 'Selene One-Piece',
    slug: 'selene-one-piece',
    shortDescription: 'Maillot escotado con soporte integrado y tejido escultor.',
    description:
      'El Selene One-Piece es el completo más vendido de Kalia. El escote en V profundo se controla con una tira interior ajustable. El tejido escultor de doble capa da soporte real sin ballenas ni estructuras rígidas.',
    category: 'completo',
    price: 18500,
    compareAtPrice: 23000,
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Ebony', hex: '#1a1a18' },
      { name: 'Forest Deep', hex: '#134b42' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['best-seller', 'escultor', 'soporte-integrado'],
    isActive: true,
    isFeatured: true,
    careInstructions: 'Lavar a mano con jabón suave. Secar a la sombra.',
    composition: '76% poliamida · 24% elastano',
    createdAt: '2026-01-05T00:00:00.000Z',
    updatedAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'c2',
    name: 'Luna Maillot',
    slug: 'luna-maillot',
    shortDescription: 'Maillot blanco roto de espalda abierta con tiras cruzadas.',
    description:
      'El Luna Maillot en blanco hueso tiene una espalda completamente abierta cruzada con tiras que forman un diseño geométrico. El delantero es entero con escote cuadrado. Ideal para combinar con un cover-up largo.',
    category: 'completo',
    price: 16800,
    compareAtPrice: null,
    images: [
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Ivory Sand', hex: '#faf9f6' },
      { name: 'Sage Shore', hex: '#80917d' },
    ],
    availableSizes: ['S', 'M', 'L', 'XL'],
    tags: ['espalda-abierta', 'nueva-llegada'],
    isActive: true,
    isFeatured: false,
    careInstructions: 'Lavar a mano. No usar lejía.',
    composition: '82% poliamida · 18% elastano',
    createdAt: '2026-02-05T00:00:00.000Z',
    updatedAt: '2026-02-05T00:00:00.000Z',
  },
  {
    id: 'c3',
    name: 'Amalfi Plunge',
    slug: 'amalfi-plunge',
    shortDescription: 'Completo con escote plunge profundo y forro de copa.',
    description:
      'El Amalfi Plunge tiene el escote más profundo de la colección, con un forro de copa removible para ajustar el soporte. La parte trasera tiene un boyleg que cubre más sin perder femineidad. Tejido mate con acabado ultra suave.',
    category: 'completo',
    price: 17200,
    compareAtPrice: 21000,
    images: [
      'https://images.unsplash.com/photo-1612422656768-d5e4ec31fac0?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Navy Coast', hex: '#1e3a5f' },
      { name: 'Terracota Kalia', hex: '#ca763b' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: ['plunge', 'copa-removible', 'inclusivo'],
    isActive: true,
    isFeatured: false,
    careInstructions: 'Lavar a mano con agua fría.',
    composition: '78% poliamida reciclada · 22% elastano',
    createdAt: '2026-01-28T00:00:00.000Z',
    updatedAt: '2026-01-28T00:00:00.000Z',
  },
  {
    id: 'c4',
    name: 'Santorini Cut-Out',
    slug: 'santorini-cut-out',
    shortDescription: 'Maillot con recortes laterales y espalda en V baja.',
    description:
      'Inspirado en las formas de los arcos cicládicos, el Santorini tiene recortes laterales que enmarcan la cintura y una espalda en V muy baja. Un diseño que maximiza el bronceado y minimiza las marcas.',
    category: 'completo',
    price: 19500,
    compareAtPrice: 24500,
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Terracota Kalia', hex: '#ca763b' },
      { name: 'Amber Dune', hex: '#eea83b' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L'],
    tags: ['cut-out', 'best-seller', 'editorial'],
    isActive: true,
    isFeatured: false,
    careInstructions: 'Lavar a mano. No retorcer.',
    composition: '80% poliamida · 20% elastano',
    createdAt: '2026-02-14T00:00:00.000Z',
    updatedAt: '2026-02-14T00:00:00.000Z',
  },

  // ── TRIKINIS ─────────────────────────────────────────────────────────────
  {
    id: 't1',
    name: 'Isola Trikini',
    slug: 'isola-trikini',
    shortDescription: 'Trikini con cuerpo cerrado y tiras decorativas doradas.',
    description:
      'El Isola Trikini combina la cobertura de un completo con la sensualidad de un bikini. Las tiras metálicas doradas sobre el cuerpo son intercambiables. Tela mate de alta densidad con tecnología de secado rápido.',
    category: 'trikini',
    price: 21500,
    compareAtPrice: 27000,
    images: [
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Sage Shore', hex: '#80917d' },
      { name: 'Ebony', hex: '#1a1a18' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['best-seller', 'tiras-metalicas', 'secado-rapido'],
    isActive: true,
    isFeatured: true,
    careInstructions: 'Lavar a mano. Retirar tiras antes de lavar.',
    composition: '76% poliamida · 24% elastano',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 't2',
    name: 'Positano String',
    slug: 'positano-string',
    shortDescription: 'Trikini de tiras finas con efecto bronceado máximo.',
    description:
      'El Positano String es para quienes buscan el mayor bronceado posible. Las tiras finitas forman una red mínima sobre el torso que conecta el top y el bottom. Colores de temporada en dorado y ámbar.',
    category: 'trikini',
    price: 18800,
    compareAtPrice: null,
    images: [
      'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Amber Dune', hex: '#eea83b' },
      { name: 'Terracota Kalia', hex: '#ca763b' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L'],
    tags: ['nueva-llegada', 'tiras-finas', 'editorial'],
    isActive: true,
    isFeatured: false,
    careInstructions: 'Lavar a mano con agua fría.',
    composition: '82% poliamida · 18% elastano',
    createdAt: '2026-02-08T00:00:00.000Z',
    updatedAt: '2026-02-08T00:00:00.000Z',
  },
  {
    id: 't3',
    name: 'Mykonos Trikini',
    slug: 'mykonos-trikini',
    shortDescription: 'Trikini blanco con detalle de anilla metálica central.',
    description:
      'El Mykonos Trikini en blanco puro tiene una anilla metálica dorada en el centro del torso que conecta el top y el bottom con elegancia mínima. La tela tiene protección UV 50+ integrada.',
    category: 'trikini',
    price: 20000,
    compareAtPrice: 25000,
    images: [
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Ivory Sand', hex: '#faf9f6' },
      { name: 'Mint Cove', hex: '#aeba8a' },
    ],
    availableSizes: ['S', 'M', 'L', 'XL'],
    tags: ['uv-50', 'anilla-metalica', 'exclusivo'],
    isActive: true,
    isFeatured: false,
    careInstructions: 'Lavar a mano. No usar suavizante.',
    composition: '80% poliamida UV · 20% elastano',
    createdAt: '2026-02-20T00:00:00.000Z',
    updatedAt: '2026-02-20T00:00:00.000Z',
  },
  {
    id: 't4',
    name: 'Bali Wrap Trikini',
    slug: 'bali-wrap-trikini',
    shortDescription: 'Trikini con cuerpo envolvente y bottom de tiro alto.',
    description:
      'El Bali Wrap tiene un cuerpo que simula un wrap frontal con cierre de presión oculto. El bottom de tiro alto y corte recto completa una silueta completamente cubierta pero sensual. Inspirado en los vestidos de playa de Bali.',
    category: 'trikini',
    price: 22500,
    compareAtPrice: 28000,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Forest Deep', hex: '#134b42' },
      { name: 'Sage Shore', hex: '#80917d' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    tags: ['wrap', 'tiro-alto', 'inclusivo', 'best-seller'],
    isActive: true,
    isFeatured: false,
    careInstructions: 'Lavar a mano. No usar lejía.',
    composition: '78% poliamida reciclada · 22% elastano',
    createdAt: '2026-01-25T00:00:00.000Z',
    updatedAt: '2026-01-25T00:00:00.000Z',
  },
];

export const FEATURED_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.isFeatured);

export function getByCategory(category: string) {
  return MOCK_PRODUCTS.filter((p) => p.category === category);
}

export function getBySlug(slug: string) {
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}
