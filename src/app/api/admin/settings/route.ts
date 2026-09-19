import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET admin profile / settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || 'RishiAdmin';

    const [rows] = await pool.query<any[]>(
      'SELECT id, username, email, security_pin FROM admins WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length === 0) {
      // Fallback to first admin
      const [all] = await pool.query<any[]>('SELECT id, username, email, security_pin FROM admins LIMIT 1');
      if (all.length === 0) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }
      return NextResponse.json(all[0]);
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch admin settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update admin settings (username, password, security PIN)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      currentUsername, 
      newUsername, 
      currentPassword, 
      newPassword, 
      email, 
      securityPin 
    } = body;

    const targetUser = currentUsername || 'RishiAdmin';

    // Fetch current admin
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM admins WHERE username = ? LIMIT 1',
      [targetUser]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Admin account not found' }, { status: 404 });
    }

    const admin = rows[0];

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }
      if (admin.password !== currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (newUsername && newUsername !== admin.username) {
      // Check if new username is already taken by another admin
      const [existing] = await pool.query<any[]>(
        'SELECT id FROM admins WHERE username = ? AND id != ? LIMIT 1',
        [newUsername, admin.id]
      );
      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Username is already taken by another user' },
          { status: 400 }
        );
      }
      updates.push('username = ?');
      values.push(newUsername);
    }

    if (newPassword) {
      updates.push('password = ?');
      values.push(newPassword);
    }

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }

    if (securityPin !== undefined) {
      updates.push('security_pin = ?');
      values.push(securityPin);
    }

    if (updates.length > 0) {
      values.push(admin.id);
      await pool.query(
        `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin settings updated successfully',
      updatedUsername: newUsername || admin.username
    });
  } catch (error: any) {
    console.error('Update admin settings error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
