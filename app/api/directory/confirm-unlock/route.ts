import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    console.log('=== CONFIRM UNLOCK START ===');
    console.log('sessionId:', sessionId);

    if (!sessionId) {
      console.log('No sessionId');
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('session.payment_status:', session.payment_status);
    console.log('session.metadata:', session.metadata);

    if (session.payment_status !== 'paid') {
      console.log('Payment not paid');
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const profileId = session.metadata?.profileId;
    const type = session.metadata?.type;
    const userId = session.metadata?.userId;

    console.log('profileId:', profileId);
    console.log('type:', type);
    console.log('userId:', userId);

    if (!profileId || !type || !userId) {
      console.log('Missing metadata');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Use upsert to avoid duplicate errors
    const unlock = await prisma.contactUnlock.upsert({
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

    console.log('=== UNLOCK RECORD CREATED/UPDATED ===', unlock.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Confirm unlock error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}