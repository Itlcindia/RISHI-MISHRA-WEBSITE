import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();
    const identifier = (email || username)?.trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Email/Username and password are required' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<any[]>(
      'SELECT id, username, email FROM admins WHERE (email = ? OR username = ?) AND password = ? LIMIT 1',
      [identifier, identifier, password]
    );

    if (rows.length > 0) {
      const admin = rows[0];
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        admin: { id: admin.id, username: admin.username, email: admin.email }
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid Admin Credentials' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
