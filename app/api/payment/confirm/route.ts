import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
  }

  const userId = session.metadata?.userId;
  const cartId = session.metadata?.cartId;

  if (!userId || !cartId) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
  }

  // Get cart items
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { book: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
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

  // Create purchase
  const purchase = await prisma.purchase.create({
    data: {
      userId,
      totalAmount: total,
      items: { create: purchaseItems },
    },
  });

  // Clear cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return NextResponse.json({ success: true, purchase });
}