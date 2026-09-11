import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/getUser';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
    }

    // Only AUTHOR or PUBLISHER can unlock
    if (user.role !== 'AUTHOR' && user.role !== 'PUBLISHER') {
      return NextResponse.json(
        { error: 'Only Authors and Publishers can unlock contacts' },
        { status: 403 }
      );
    }

    const { id, type } = await req.json();
    if (!id || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (type !== 'author' && type !== 'publisher') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Fetch the target profile
    let profile;
    if (type === 'author') {
      profile = await prisma.author.findUnique({ where: { id } });
    } else {
      profile = await prisma.publisher.findUnique({ where: { id } });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Prevent unlocking your own profile
    const [ownAuthor, ownPublisher] = await Promise.all([
      prisma.author.findUnique({
        where: { userId: user.id },
        select: { id: true },
      }),
      prisma.publisher.findUnique({
        where: { userId: user.id },
        select: { id: true },
      }),
    ]);

    if (
      (type === 'author' && ownAuthor?.id === id) ||
      (type === 'publisher' && ownPublisher?.id === id)
    ) {
      return NextResponse.json(
        { error: 'You cannot unlock your own contact' },
        { status: 400 }
      );
    }

    // Check if already unlocked
    const existing = await prisma.contactUnlock.findUnique({
      where: {
        userId_profileId_profileType: {
          userId: user.id,
          profileId: id,
          profileType: type.toUpperCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already unlocked', alreadyUnlocked: true },
        { status: 400 }
      );
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Unlock contact: ${profile.name}`,
              description: 'One-time payment to reveal contact information',
            },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/directory/unlock/${id}?type=${type}&paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/directory`,
      metadata: {
        profileId: id,
        type: type,
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    );
  }
}