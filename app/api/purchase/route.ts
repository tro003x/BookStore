import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { book: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  let total = 0;
  const purchaseItems = cart.items.map((item) => {
    const price = Number(item.book.price);
    total += price * item.quantity;
    return {
      bookId: item.bookId,
      quantity: item.quantity,
      priceAtPurchase: price,
    };
  });

  const purchase = await prisma.purchase.create({
    data: {
      userId: user.id,
      totalAmount: total,
      items: { create: purchaseItems },
    },
    include: { items: { include: { book: true } } },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json(purchase, { status: 201 });
}