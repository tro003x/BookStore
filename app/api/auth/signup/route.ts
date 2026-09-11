import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export const runtime = 'nodejs';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export async function POST(request: Request) {
  try {
    const { name, email, password, role, phone } = await request.json();

    // Required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Password strength
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['READER', 'AUTHOR', 'PUBLISHER'];
    const userRole = role || 'READER';
    if (!validRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { author: true, publisher: true },
    });

    // ============ EXISTING USER ============
    if (existingUser) {
      // Already verified → real "user exists"
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.' },
          { status: 400 }
        );
      }

      // Unverified → resend verification email (don't create duplicate)
      try {
        // Delete old tokens
        await prisma.verificationToken.deleteMany({
          where: { userId: existingUser.id },
        });

        const newToken = crypto.randomBytes(32).toString('hex');
        await prisma.verificationToken.create({
          data: {
            userId: existingUser.id,
            token: newToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });

        // Update password to whatever they just typed (in case they typo'd)
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash: hashedPassword,
            name: name || existingUser.name,
          },
        });

        await sendVerificationEmail(
          email,
          newToken,
          existingUser.name || 'there'
        );

        return NextResponse.json(
          {
            message:
              'Account exists but is unverified. A new verification email was sent.',
            userId: existingUser.id,
            requiresVerification: true,
            resent: true,
          },
          { status: 200 }
        );
      } catch (emailErr) {
        console.error('Resend verification failed:', emailErr);
        return NextResponse.json(
          {
            error:
              'Account exists but verification email failed to send. Please try again.',
          },
          { status: 500 }
        );
      }
    }

    // ============ NEW USER ============
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name: name || null,
        role: userRole,
        emailVerified: null,
      },
    });

    // Create Author/Publisher profile
    if (userRole === 'AUTHOR') {
      await prisma.author.create({
        data: {
          userId: user.id,
          name: name || '',
          email,
          phone: phone || null,
          verificationStatus: 'PENDING',
        },
      });
    }

    if (userRole === 'PUBLISHER') {
      await prisma.publisher.create({
        data: {
          userId: user.id,
          name: name || '',
          email,
          phone: phone || null,
          verificationStatus: 'PENDING',
        },
      });
    }

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Try to send email — DON'T fail signup if it errors
    try {
      await sendVerificationEmail(email, token, name || 'there');
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr);
      // User is created. They can resend from login page.
    }

    return NextResponse.json(
      {
        message:
          'Account created. Check your email to verify your account.',
        userId: user.id,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          'Something went wrong. Please try again.',
      },
      { status: 500 }
    );
  }
}