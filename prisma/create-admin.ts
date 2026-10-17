import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] npm run admin:create --prefix server
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Admin';

  if (!email || !password) throw new Error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres');

  const hash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: { password: hash, name },
    create: { email, password: hash, name },
  });
  console.log(`Admin listo: ${email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
