import 'dotenv/config';
import { PrismaClient, ProductCategory } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Aurelia Set',
    slug: 'aurelia-set',
    description:
      'A bandeau bikini with soft compression fabric, removable straps, and a polished gold-tone clasp.',
    shortDescription: 'Refined bandeau bikini with sculpt fit.',
    category: ProductCategory.bikini,
    price: 14500,
    compareAtPrice: 18000,
    images: [
      'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: [
      { name: 'Sage Shore', hex: '#80917D' },
      { name: 'Amber Light', hex: '#EEA83B' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L'],
    tags: ['best-seller', 'bikini', 'resort'],
    isFeatured: true,
    careInstructions: 'Cold hand wash, dry flat, avoid rough surfaces.',
    composition: '78% recycled polyamide, 22% elastane',
    stock: [
      { size: 'S', colorName: 'Sage Shore', sku: 'KAL-AUR-SS-S', quantity: 8 },
      { size: 'M', colorName: 'Amber Light', sku: 'KAL-AUR-AL-M', quantity: 6 },
    ],
  },
  {
    name: 'Nerina Triangle',
    slug: 'nerina-triangle',
    description: 'Triangle bikini with elongated ties and matte finish for understated shine.',
    shortDescription: 'Minimal triangle bikini in warm coastal tones.',
    category: ProductCategory.bikini,
    price: 13200,
    compareAtPrice: 16400,
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: [
      { name: 'Forest Tide', hex: '#134B42' },
      { name: 'Terracotta Sun', hex: '#CA763B' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L'],
    tags: ['triangle', 'bikini', 'summer'],
    isFeatured: false,
    careInstructions: 'Rinse after salt water, hand wash cold.',
    composition: '80% nylon, 20% spandex',
    stock: [
      { size: 'XS', colorName: 'Forest Tide', sku: 'KAL-NER-FT-XS', quantity: 5 },
      { size: 'L', colorName: 'Terracotta Sun', sku: 'KAL-NER-TS-L', quantity: 4 },
    ],
  },
  {
    name: 'Selene One-Piece',
    slug: 'selene-one-piece',
    description: 'Contoured one-piece with square neckline, inner mesh support, and low scoop back.',
    shortDescription: 'Architectural one-piece with sculpt support.',
    category: ProductCategory.completo,
    price: 16800,
    compareAtPrice: 21000,
    images: [
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: [
      { name: 'Ivory Sand', hex: '#FAF9F6' },
      { name: 'Forest Tide', hex: '#134B42' },
    ],
    availableSizes: ['S', 'M', 'L', 'XL'],
    tags: ['one-piece', 'support', 'featured'],
    isFeatured: true,
    careInstructions: 'Hand wash separately, avoid bleach and tumble drying.',
    composition: '75% recycled polyester, 25% elastane',
    stock: [
      { size: 'M', colorName: 'Ivory Sand', sku: 'KAL-SEL-IS-M', quantity: 7 },
      { size: 'XL', colorName: 'Forest Tide', sku: 'KAL-SEL-FT-XL', quantity: 3 },
    ],
  },
  {
    name: 'Calista Drape',
    slug: 'calista-drape',
    description: 'Soft draped one-piece with asymmetrical strap and elegant waist shaping.',
    shortDescription: 'Draped completo with asymmetrical elegance.',
    category: ProductCategory.completo,
    price: 17400,
    compareAtPrice: 21800,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: [
      { name: 'Terracotta Sun', hex: '#CA763B' },
      { name: 'Mint Haze', hex: '#AEBA8A' },
    ],
    availableSizes: ['S', 'M', 'L'],
    tags: ['one-piece', 'occasion', 'editorial'],
    isFeatured: false,
    careInstructions: 'Wash by hand with neutral soap and dry in shade.',
    composition: '77% polyamide, 23% elastane',
    stock: [
      { size: 'S', colorName: 'Terracotta Sun', sku: 'KAL-CAL-TS-S', quantity: 4 },
      { size: 'M', colorName: 'Mint Haze', sku: 'KAL-CAL-MH-M', quantity: 6 },
    ],
  },
  {
    name: 'Isola Trikini',
    slug: 'isola-trikini',
    description: 'Statement trikini with ring hardware, clean cutouts, and fully lined finish.',
    shortDescription: 'Signature trikini with polished metal detail.',
    category: ProductCategory.trikini,
    price: 18200,
    compareAtPrice: 22800,
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: [
      { name: 'Black Reef', hex: '#1A1A18' },
      { name: 'Amber Light', hex: '#EEA83B' },
    ],
    availableSizes: ['XS', 'S', 'M', 'L'],
    tags: ['trikini', 'limited', 'hardware'],
    isFeatured: true,
    careInstructions: 'Remove salt and chlorine after use. Dry flat.',
    composition: '79% nylon, 21% elastane',
    stock: [
      { size: 'S', colorName: 'Black Reef', sku: 'KAL-ISO-BR-S', quantity: 5 },
      { size: 'M', colorName: 'Amber Light', sku: 'KAL-ISO-AL-M', quantity: 5 },
    ],
  },
];

async function main() {
  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.images,
        colors: product.colors,
        availableSizes: product.availableSizes,
        tags: product.tags,
        isFeatured: product.isFeatured,
        careInstructions: product.careInstructions,
        composition: product.composition,
        stock: {
          deleteMany: {},
          create: product.stock,
        },
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.images,
        colors: product.colors,
        availableSizes: product.availableSizes,
        tags: product.tags,
        isActive: true,
        isFeatured: product.isFeatured,
        careInstructions: product.careInstructions,
        composition: product.composition,
        stock: {
          create: product.stock,
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
