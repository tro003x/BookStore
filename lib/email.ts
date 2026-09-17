import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sender = `"${process.env.GMAIL_SENDER_NAME || 'BoiStore'}" <${process.env.GMAIL_USER}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function sendEmail(to: string, subject: string, html: string) {
  console.log('[EMAIL] Sending to:', to);
  const info = await transporter.sendMail({
    from: sender,
    to,
    subject,
    html,
  });
  console.log('[EMAIL] Sent:', info.messageId);
  return info;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
) {
  const verifyLink = `${APP_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    'Verify your BoiStore email',
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1A1D1E;">Welcome to BoiStore, ${name}!</h2>
        <p style="color: #6B7280; line-height: 1.6;">
          Please verify your email address to activate your account. This link expires in 24 hours.
        </p>
        <a href="${verifyLink}" style="display: inline-block; background: #4B5D45; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `
  );
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    'Reset your BoiStore password',
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1A1D1E;">Reset your password</h2>
        <p style="color: #6B7280; line-height: 1.6;">
          Click the button below to reset your BoiStore password. This link expires in 1 hour.
        </p>
        <a href="${resetLink}" style="display: inline-block; background: #4B5D45; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `
  );
}