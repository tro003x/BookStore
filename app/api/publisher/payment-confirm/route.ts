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

  const bookId = session.metadata?.bookId;

  if (!bookId) {
    return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
  }

  const book = await prisma.book.update({
    where: { id: bookId },
    data: {
      paymentStatus: 'PAID',
      status: 'PENDING',
    },
  });

  return NextResponse.json({ success: true, book });
}