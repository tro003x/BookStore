import { PrismaClient, Role, BookStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // 1. Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { emailVerified: now, role: Role.ADMIN },
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin',
      role: Role.ADMIN,
      emailVerified: now,
    },
  });
  console.log('Admin ready:', admin.email);

  // 2. Publisher
  const pubPassword = await bcrypt.hash('publisher123', 10);
  const pubUser = await prisma.user.upsert({
    where: { email: 'publisher@example.com' },
    update: { emailVerified: now },
    create: {
      email: 'publisher@example.com',
      passwordHash: pubPassword,
      name: 'Test Publisher',
      role: Role.PUBLISHER,
      emailVerified: now,
    },
  });
  const publisher = await prisma.publisher.upsert({
    where: { userId: pubUser.id },
    update: {},
    create: {
      userId: pubUser.id,
      name: 'Test Publisher Inc.',
      email: 'publisher@example.com',
      approved: true,
      verificationStatus: 'APPROVED',
    },
  });

  // 3. Author
  const authorPassword = await bcrypt.hash('author123', 10);
  const authorUser = await prisma.user.upsert({
    where: { email: 'author@example.com' },
    update: { emailVerified: now },
    create: {
      email: 'author@example.com',
      passwordHash: authorPassword,
      name: 'Test Author',
      role: Role.AUTHOR,
      emailVerified: now,
    },
  });
  const author = await prisma.author.upsert({
    where: { userId: authorUser.id },
    update: {},
    create: {
      userId: authorUser.id,
      name: 'Test Author',
      email: 'author@example.com',
      verificationStatus: 'APPROVED',
    },
  });

  // 4. Reader
  const readerPassword = await bcrypt.hash('reader123', 10);
  const reader = await prisma.user.upsert({
    where: { email: 'reader@example.com' },
    update: { emailVerified: now },
    create: {
      email: 'reader@example.com',
      passwordHash: readerPassword,
      name: 'Reader',
      role: Role.READER,
      emailVerified: now,
    },
  });
  console.log('Reader ready:', reader.email);

  // 5. Categories
    // 5. Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Fiction' },
      update: {},
      create: { name: 'Fiction' },
    }),
    prisma.category.upsert({
      where: { name: 'Science' },
      update: {},
      create: { name: 'Science' },
    }),
    prisma.category.upsert({
      where: { name: 'Poetry' },
      update: {},
      create: { name: 'Poetry' },
    }),
    prisma.category.upsert({
      where: { name: 'Novel' },
      update: {},
      create: { name: 'Novel' },
    }),
    prisma.category.upsert({
      where: { name: 'Biography' },
      update: {},
      create: { name: 'Biography' },
    }),
    prisma.category.upsert({
      where: { name: 'Self-Help' },
      update: {},
      create: { name: 'Self-Help' },
    }),
    prisma.category.upsert({
      where: { name: 'History' },
      update: {},
      create: { name: 'History' },
    }),
    prisma.category.upsert({
      where: { name: 'Fantasy' },
      update: {},
      create: { name: 'Fantasy' },
    }),
    prisma.category.upsert({
      where: { name: 'Mystery' },
      update: {},
      create: { name: 'Mystery' },
    }),
    prisma.category.upsert({
      where: { name: 'Romance' },
      update: {},
      create: { name: 'Romance' },
    }),
    prisma.category.upsert({
      where: { name: 'Technology' },
      update: {},
      create: { name: 'Technology' },
    }),
    prisma.category.upsert({
      where: { name: 'Philosophy' },
      update: {},
      create: { name: 'Philosophy' },
    }),
  ]);

  // Find specific ones for book seeding below
  const fiction = categories.find((c) => c.name === 'Fiction')!;
  const science = categories.find((c) => c.name === 'Science')!;

  // 6. Books
  await prisma.book.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'The Great Novel',
        authorName: 'John Doe',
        description: 'A thrilling story about adventure.',
        price: 14.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: fiction.id,
        publishedAt: now,
      },
      {
        title: 'Quantum Physics for Beginners',
        authorName: 'Dr. Alice',
        description: 'Simple introduction to quantum mechanics.',
        price: 29.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: science.id,
        publishedAt: now,
      },
      {
        title: 'The Art of Coding',
        authorName: 'Bob Coder',
        description: 'Learn programming fundamentals.',
        price: 19.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: science.id,
        publishedAt: now,
      },
      {
        title: 'Biography of a Genius',
        authorName: 'Jane Writer',
        description: 'Life story of a famous inventor.',
        price: 12.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: fiction.id,
        publishedAt: now,
      },
    ],
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });