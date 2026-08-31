import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookId } = await req.json();

  const book = await prisma.book.findUnique({
    where: { id: bookId, status: 'APPROVED' },
  });

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: book.title,
            description: book.description || 'PDF book',
          },
          unit_amount: Math.round(Number(book.price) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/book/${bookId}`,
    metadata: {
      userId: user.id,
      bookId: book.id,
    },
  });

  return NextResponse.json({ url: session.url });
}