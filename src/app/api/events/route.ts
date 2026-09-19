import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFile } from '@/lib/upload-helper';

export async function GET() {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, eventName, location, date, descriptionHi, descriptionEn, image, createdAt FROM events ORDER BY date DESC, id DESC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fetch events error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const eventName = (formData.get('eventName') as string) || '';
    const location = (formData.get('location') as string) || '';
    const descriptionHi = (formData.get('descriptionHi') as string) || '';
    const descriptionEn = (formData.get('descriptionEn') as string) || '';
    const date = (formData.get('date') as string) || new Date().toISOString().slice(0, 10);

    let image: string | null = (formData.get('image') as string) || null;
    const file = formData.get('image') as File | null;
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      image = await saveUploadedFile(file, 'events');
    }

    const [result] = await pool.query<any>(
      `INSERT INTO events (eventName, location, descriptionHi, descriptionEn, date, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventName, location, descriptionHi, descriptionEn, date, image]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Event created successfully',
        id: result.insertId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
