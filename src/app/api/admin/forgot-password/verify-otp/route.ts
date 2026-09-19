import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { identifier, otp, newPassword } = await req.json();

    if (!identifier || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Username/Email, OTP, and New Password are required.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();
    const trimmedOtp = otp.trim();

    // Query admin by username or email
    const [rows]: any = await pool.query(
      'SELECT id, username, email, reset_otp, otp_expires_at FROM admins WHERE username = ? OR email = ? LIMIT 1',
      [trimmedIdentifier, trimmedIdentifier]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No admin account found.' },
        { status: 404 }
      );
    }

    const admin = rows[0];

    // Check if OTP was generated
    if (!admin.reset_otp) {
      return NextResponse.json(
        { success: false, message: 'No OTP request found. Please click "Send OTP" first.' },
        { status: 400 }
      );
    }

    // Verify OTP matches
    if (admin.reset_otp !== trimmedOtp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP code. Please enter the correct OTP sent to your email.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (admin.otp_expires_at && new Date(admin.otp_expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'This OTP has expired (valid for 10 minutes). Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Update password and clear OTP
    await pool.query(
      'UPDATE admins SET password = ?, reset_otp = NULL, otp_expires_at = NULL WHERE id = ?',
      [newPassword, admin.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
      username: admin.username,
    });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error during password reset.' },
      { status: 500 }
    );
  }
}
