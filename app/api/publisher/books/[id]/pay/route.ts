import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);

    if (!user || user.role !== 'PUBLISHER' || !user.publisher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const book = await prisma.book.findUnique({
      where: { id, publisherId: user.publisher.id },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Submission fee: ${book.title}`,
              description: 'One-time fee to submit this book for approval',
            },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/publisher/payment-success?bookId=${book.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/publisher`,
      metadata: {
        bookId: book.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Pay error:', error);
    return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 500 });
  }
}