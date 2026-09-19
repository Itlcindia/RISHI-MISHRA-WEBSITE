import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, name, email, phone, message, sentAt FROM messages ORDER BY sentAt DESC, id DESC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<any>(
      'INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, message]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
        id: result.insertId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create message error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
