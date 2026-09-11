import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string, name: string) {
  // === DEBUG ===
  console.log('[EMAIL] RESEND_API_KEY set?', !!process.env.RESEND_API_KEY);
  console.log('[EMAIL] RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length);
  console.log('[EMAIL] Sending to:', email);

  const verifyLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Verify your BoiStore email',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1A1D1E;">Welcome to BoiStore, ${name}!</h2>
        <p style="color: #6B7280; line-height: 1.6;">
          Please verify your email. Link expires in 24 hours.
        </p>
        <a href="${verifyLink}"
           style="display: inline-block; background: #4B5D45; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Verify Email
        </a>
      </div>
    `,
  });

  if (error) {
    console.error('[EMAIL] Resend API error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  console.log('[EMAIL] Resend success, id =', data?.id);
  return data;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  console.log('[EMAIL] RESEND_API_KEY set?', !!process.env.RESEND_API_KEY);
  console.log('[EMAIL] Sending password reset to:', email);

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your BoiStore password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1A1D1E;">Reset your password</h2>
        <p style="color: #6B7280; line-height: 1.6;">
          Click below to reset your password. Link expires in 1 hour.
        </p>
        <a href="${resetLink}"
           style="display: inline-block; background: #4B5D45; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
      </div>
    `,
  });

  if (error) {
    console.error('[EMAIL] Resend API error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  console.log('[EMAIL] Resend success, id =', data?.id);
  return data;
}