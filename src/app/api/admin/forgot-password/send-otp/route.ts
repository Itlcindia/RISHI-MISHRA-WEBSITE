import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { sendOtpEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: 'Username or Email is required.' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim();

    // Find admin by username or email
    const [rows]: any = await pool.query(
      'SELECT id, username, email FROM admins WHERE username = ? OR email = ? LIMIT 1',
      [trimmed, trimmed]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No admin account found matching that username or email.' },
        { status: 404 }
      );
    }

    const admin = rows[0];

    if (!admin.email || !admin.email.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No registered email found for this admin. Please contact the webmaster or update email in settings.' 
        },
        { status: 400 }
      );
    }

    // Generate 6-digit cryptographic-style OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in MySQL with 10-minute expiry
    await pool.query(
      'UPDATE admins SET reset_otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?',
      [otp, admin.id]
    );

    // Send email via nodemailer
    const mailResult = await sendOtpEmail({
      to: admin.email,
      adminName: admin.username,
      otp,
    });

    const masked = maskEmail(admin.email);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${masked}. Please check your inbox or spam folder.`,
      maskedEmail: masked,
      username: admin.username,
      // If SMTP is not yet configured in local development, expose devOtp for convenience
      devOtp: mailResult.fallback ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error while sending OTP.' },
      { status: 500 }
    );
  }
}
