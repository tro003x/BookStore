import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const selectedItemIds: string[] = Array.isArray(body.itemIds) ? body.itemIds : [];

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { book: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart empty' }, { status: 400 });
    }

    // Filter to selected items (or all if none selected)
    const itemsToCheckout =
      selectedItemIds.length > 0
        ? cart.items.filter((i) => selectedItemIds.includes(i.id))
        : cart.items;

    if (itemsToCheckout.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 });
    }

    const lineItems = itemsToCheckout.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.book.title,
          description: item.book.description || 'PDF book',
        },
        unit_amount: Math.round(Number(item.book.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      metadata: {
        userId: user.id,                                           
        cartId: cart.id,                                            
        selectedItemIds: itemsToCheckout.map((i) => i.id).join(','), 
      },
    });

    console.log('PURCHASE: session created', session.id, {
      userId: user.id,
      cartId: cart.id,
      itemCount: itemsToCheckout.length,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('PURCHASE EXCEPTION:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    );
  }
}