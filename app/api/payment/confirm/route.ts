import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    const cartId = session.metadata?.cartId;
    const selectedIdsRaw = session.metadata?.selectedItemIds || '';
    const selectedIds = selectedIdsRaw ? selectedIdsRaw.split(',') : [];

    if (!userId || !cartId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { book: true } } },
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    // Filter cart items by selected IDs
    const itemsToProcess = selectedIds.length > 0
      ? cart.items.filter((i) => selectedIds.includes(i.id))
      : cart.items;

    if (itemsToProcess.length === 0) {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    let total = 0;
    const purchaseItems = itemsToProcess.map((item) => {
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

    // Remove only purchased items from cart
    await prisma.cartItem.deleteMany({
      where: { id: { in: itemsToProcess.map((i) => i.id) } },
    });

    return NextResponse.json({ success: true, purchase });
  } catch (error: any) {
    console.error('CONFIRM EXCEPTION:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}