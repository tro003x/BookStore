import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookId, quantity = 1 } = await req.json();
  if (!bookId) return NextResponse.json({ error: 'Book ID required' }, { status: 400 });

  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_bookId: { cartId: cart.id, bookId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, bookId, quantity },
    });
  }

  return NextResponse.json({ message: 'Added to cart' });
}