import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    console.log('Confirm unlock - sessionId:', sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('Stripe session status:', session.payment_status);
    console.log('Metadata:', session.metadata);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const profileId = session.metadata?.profileId;
    const type = session.metadata?.type;
    const userId = session.metadata?.userId;

    if (!profileId || !type || !userId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    await prisma.contactUnlock.create({
      data: {
        userId,
        profileId,
        profileType: type.toUpperCase(),
      },
    });

    console.log('Unlock record created');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Confirm unlock error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}