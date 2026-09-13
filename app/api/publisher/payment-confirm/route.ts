
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const cleanSessionId = sessionId.replace(/[{}]/g, '');
    const session = await stripe.checkout.sessions.retrieve(cleanSessionId);

    console.log(
      'PUBLISHER PAYMENT CONFIRM:',
      session.payment_status,
      'bookId =',
      session.metadata?.bookId
    );

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const bookId = session.metadata?.bookId;
    if (!bookId) {
      return NextResponse.json({ error: 'Missing bookId in metadata' }, { status: 400 });
    }

    await prisma.book.update({
      where: { id: bookId },
      data: {
        paymentStatus: 'PAID',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Publisher confirm error:', error);
    return NextResponse.json(
      { error: error.message || 'Confirmation failed' },
      { status: 500 }
    );
  }
}