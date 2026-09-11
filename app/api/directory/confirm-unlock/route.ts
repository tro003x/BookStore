import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Invalid sessionId' }, { status: 400 });
    }

    // Strip any stray braces Stripe might have left in
    const cleanSessionId = sessionId.replace(/[{}]/g, '');

    const session = await stripe.checkout.sessions.retrieve(cleanSessionId);
    console.log('CONFIRM UNLOCK:', session.payment_status, session.metadata);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const profileId = session.metadata?.profileId;
    const type = session.metadata?.type;
    const userId = session.metadata?.userId;

    if (!profileId || !type || !userId) {
      console.error('Missing metadata:', session.metadata);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    await prisma.contactUnlock.upsert({
      where: {
        userId_profileId_profileType: {
          userId,
          profileId,
          profileType: type.toUpperCase(),
        },
      },
      update: {},
      create: {
        userId,
        profileId,
        profileType: type.toUpperCase(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Confirm unlock error:', error);
    return NextResponse.json(
      { error: error.message || 'Confirmation failed' },
      { status: 500 }
    );
  }
}