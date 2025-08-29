// prisma/seed.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@sitasndt.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'StrongP@ss1!';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Admin', passwordHash, role: 'ADMIN' },
  });

  console.log('Seeded ADMIN:', email);
}

main().finally(() => prisma.$disconnect());
// Prevent multiple instances of Prisma Client in development