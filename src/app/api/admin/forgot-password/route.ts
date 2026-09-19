import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, securityPin, newPassword } = await req.json();

    if (!username || !securityPin || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Username, Security PIN, and New Password are all required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // Find admin by username (case-insensitive)
    const [rows] = await pool.query<any[]>(
      'SELECT id, username, password, security_pin FROM admins WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [username.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Admin username not found.' },
        { status: 404 }
      );
    }

    const admin = rows[0];

    // Check Security PIN (match stored pin or fallback default '123456')
    const storedPin = admin.security_pin || '123456';
    if (securityPin.trim() !== storedPin.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid Security PIN. Please enter the correct recovery PIN.' },
        { status: 401 }
      );
    }

    // Update password
    await pool.query(
      'UPDATE admins SET password = ? WHERE id = ?',
      [newPassword, admin.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}
