import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const cleanSessionId = sessionId.replace(/[{}]/g, '');
    const session = await stripe.checkout.sessions.retrieve(cleanSessionId);

    console.log('CONFIRM: status', session.payment_status, 'metadata', session.metadata);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    const cartId = session.metadata?.cartId;
    const bookId = session.metadata?.bookId;

    if (!userId) {
      console.error('CONFIRM: missing userId', session.metadata);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    /* ============================================================
       FLOW 1: Single-book "Buy Now" purchase (has bookId)
       ============================================================ */
    if (bookId) {
      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

      // Idempotency: if purchase already exists for this user+book via this session, skip
      const existing = await prisma.purchase.findFirst({
        where: {
          userId,
          items: { some: { bookId } },
        },
      });

      if (existing) {
        console.log('CONFIRM (single): already purchased');
        return NextResponse.json({ success: true, alreadyPurchased: true });
      }

      const price = Number(book.price);
      const purchase = await prisma.purchase.create({
        data: {
          userId,
          totalAmount: price,
          items: {
            create: [
              {
                bookId: book.id,
                quantity: 1,
                priceAtPurchase: price,
              },
            ],
          },
        },
      });

      console.log('CONFIRM (single): purchase created', purchase.id);
      return NextResponse.json({ success: true, purchase });
    }

    /* ============================================================
       FLOW 2: Cart checkout (has cartId)
       ============================================================ */
    if (cartId) {
      const selectedIdsRaw = session.metadata?.selectedItemIds || '';
      const selectedIds = selectedIdsRaw ? selectedIdsRaw.split(',') : [];

      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { book: true } } },
      });

      if (!cart) {
        return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
      }

      const itemsToProcess =
        selectedIds.length > 0
          ? cart.items.filter((i) => selectedIds.includes(i.id))
          : cart.items;

      if (itemsToProcess.length === 0) {
        console.log('CONFIRM (cart): already processed');
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

      await prisma.cartItem.deleteMany({
        where: { id: { in: itemsToProcess.map((i) => i.id) } },
      });

      console.log('CONFIRM (cart): purchase created', purchase.id);
      return NextResponse.json({ success: true, purchase });
    }

    /* ============================================================
       Unknown flow
       ============================================================ */
    console.error('CONFIRM: unknown metadata shape', session.metadata);
    return NextResponse.json(
      { error: 'Missing metadata' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('CONFIRM EXCEPTION:', error);
    return NextResponse.json(
      { error: error.message || 'Confirmation failed' },
      { status: 500 }
    );
  }
}