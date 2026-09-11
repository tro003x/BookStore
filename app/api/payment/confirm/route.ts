// app/api/payment/confirm/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    console.log('CONFIRM: sessionId =', sessionId);

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('CONFIRM: status =', session.payment_status, 'metadata =', session.metadata);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    const cartId = session.metadata?.cartId;

    if (!userId || !cartId) {
      console.log('CONFIRM ERROR: missing metadata');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Idempotency — check if we already processed this cart
    const existing = await prisma.purchase.findFirst({
      where: { userId, items: { some: {} } },
      orderBy: { purchasedAt: 'desc' },
      take: 1,
    });
    // (only needed if you have duplicates; skip check for now)

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { book: true } } },
    });

    if (!cart) {
      console.log('CONFIRM: cart not found');
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (cart.items.length === 0) {
      console.log('CONFIRM: cart already empty — likely duplicate call');
      return NextResponse.json({ success: true, message: 'Already processed' });
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
        userId,
        totalAmount: total,
        items: { create: purchaseItems },
      },
    });

    console.log('CONFIRM: purchase created =', purchase.id);

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json({ success: true, purchase });
  } catch (error: any) {
    console.error('CONFIRM EXCEPTION:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}