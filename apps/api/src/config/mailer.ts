// src/config/mailer.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Email Templates ───────────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: 'Verify your TaskEarn Pro account',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Welcome to TaskEarn Pro! 🎉</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4f8ef7;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Verify Email
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">
          Link expires in 24 hours. If you didn't register, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: 'Reset your TaskEarn Pro password',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#4f8ef7;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Reset Password
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">
          Link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendSubmissionResultEmail(
  email: string,
  jobTitle: string,
  status: 'approved' | 'rejected',
  earnings?: number,
  feedback?: string
) {
  const approved = status === 'approved';
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `Submission ${approved ? 'Approved ✅' : 'Rejected ❌'} — ${jobTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>${approved ? '🎉 Submission Approved!' : '❌ Submission Rejected'}</h2>
        <p>Your submission for <strong>${jobTitle}</strong> has been ${status}.</p>
        ${approved && earnings ? `<p>💰 Earnings added to your wallet: <strong>$${earnings.toFixed(2)}</strong></p>` : ''}
        ${feedback ? `<p>📝 Feedback: ${feedback}</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/submissions" 
           style="display:inline-block;padding:12px 24px;background:#4f8ef7;color:#fff;border-radius:8px;text-decoration:none">
          View Submissions
        </a>
      </div>
    `,
  });
}
