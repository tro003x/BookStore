import { PrismaClient, Role, BookStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Create the adapter using your DATABASE_URL from environment
const pool = new Pool({ 
  connectionString: 'postgresql://postgres:5bl5V7KkCxlCXOrXaa@db.idklhpsivzxcmieoownk.supabase.co:5432/postgres?sslmode=no-verify' 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin',
      role: Role.ADMIN,
    },
  });

  // 2. Publisher user + publisher profile (approved)
  const pubPassword = await bcrypt.hash('publisher123', 10);
  const pubUser = await prisma.user.upsert({
    where: { email: 'publisher@example.com' },
    update: {},
    create: {
      email: 'publisher@example.com',
      passwordHash: pubPassword,
      name: 'Test Publisher',
      role: Role.PUBLISHER,
    },
  });
  const publisher = await prisma.publisher.upsert({
    where: { userId: pubUser.id },
    update: {},
    create: {
      userId: pubUser.id,
      name: 'Test Publisher Inc.',
      approved: true,
    },
  });

  // 3. Categories
  const fiction = await prisma.category.upsert({
    where: { name: 'Fiction' },
    update: {},
    create: { name: 'Fiction' },
  });
  const science = await prisma.category.upsert({
    where: { name: 'Science' },
    update: {},
    create: { name: 'Science' },
  });

  // 4. Books (4 books)
  await prisma.book.createMany({
    data: [
      {
        title: 'The Great Novel',
        author: 'John Doe',
        description: 'A thrilling story about adventure.',
        price: 14.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: fiction.id,
        publishedAt: new Date(),
      },
      {
        title: 'Quantum Physics for Beginners',
        author: 'Dr. Alice',
        description: 'Simple introduction to quantum mechanics.',
        price: 29.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: science.id,
        publishedAt: new Date(),
      },
      {
        title: 'The Art of Coding',
        author: 'Bob Coder',
        description: 'Learn programming fundamentals.',
        price: 19.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: science.id,
        publishedAt: new Date(),
      },
      {
        title: 'Biography of a Genius',
        author: 'Jane Writer',
        description: 'Life story of a famous inventor.',
        price: 12.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: fiction.id,
        publishedAt: new Date(),
      },
    ],
  });

  // 5. Reader user
  const readerPassword = await bcrypt.hash('reader123', 10);
  await prisma.user.upsert({
    where: { email: 'reader@example.com' },
    update: {},
    create: {
      email: 'reader@example.com',
      passwordHash: readerPassword,
      name: 'Reader',
      role: Role.READER,
    },
  });

  console.log('Seed completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });