import { PrismaClient, ProductCategory } from '@prisma/client';
import { MOCK_PRODUCTS } from '../client/src/data/mockProducts';

const prisma = new PrismaClient();

// Una sola fuente de verdad para el catálogo: el mismo que usa el cliente como fallback.
const sampleProducts = MOCK_PRODUCTS.map((p) => ({
  name: p.name,
  slug: p.slug,
  description: p.description,
  shortDescription: p.shortDescription,
  category: p.category as ProductCategory,
  price: p.price,
  compareAtPrice: p.compareAtPrice ?? null,
  images: p.images,
  colors: p.colors.map(({ name, hex }) => ({ name, hex })),
  availableSizes: p.availableSizes,
  tags: p.tags,
  isFeatured: p.isFeatured,
  careInstructions: p.careInstructions,
  composition: p.composition,
  stock: p.colors.flatMap((color, ci) =>
    p.availableSizes.map((size, si) => ({
      size,
      colorName: color.name,
      sku: `KAL-${p.slug.toUpperCase()}-${color.name.replace(/[^a-z0-9]/gi, '').toUpperCase()}-${size}`,
      // Cantidades deterministas entre 0 y 9 para que el dashboard muestre algo de stock bajo.
      quantity: (p.slug.length + ci * 3 + si * 2) % 10,
    })),
  ),
}));

async function main() {
  for (const { stock, ...product } of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...product,
        stock: {
          deleteMany: {},
          create: stock,
        },
      },
      create: {
        ...product,
        isActive: true,
        stock: {
          create: stock,
        },
      },
    });
  }
  console.log(`Seeded ${sampleProducts.length} products`);
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
