import { PrismaClient, Role, BookStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
        authorName: 'John Doe',
        description: 'A thrilling story about adventure.',
        price: 14.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: fiction.id,
        publishedAt: new Date(),
      },
      {
        title: 'Quantum Physics for Beginners',
        authorName: 'Dr. Alice',
        description: 'Simple introduction to quantum mechanics.',
        price: 29.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: science.id,
        publishedAt: new Date(),
      },
      {
        title: 'The Art of Coding',
        authorName: 'Bob Coder',
        description: 'Learn programming fundamentals.',
        price: 19.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: science.id,
        publishedAt: new Date(),
      },
      {
        title: 'Biography of a Genius',
        authorName: 'Jane Writer',
        description: 'Life story of a famous inventor.',
        price: 12.99,
        status: BookStatus.APPROVED,
        publisherId: publisher.id,
        categoryId: fiction.id,
        publishedAt: new Date(),
      },
    ],
  });

  // Author user
const authorPassword = await bcrypt.hash('author123', 10);
const authorUser = await prisma.user.upsert({
  where: { email: 'author@example.com' },
  update: {},
  create: {
    email: 'author@example.com',
    passwordHash: authorPassword,
    name: 'Test Author',
    role: 'AUTHOR',
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
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());