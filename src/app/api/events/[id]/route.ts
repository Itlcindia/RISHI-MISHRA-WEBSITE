import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFile } from '@/lib/upload-helper';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<any[]>(
      'SELECT id, eventName, location, date, descriptionHi, descriptionEn, image, createdAt FROM events WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch single event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const eventName = (formData.get('eventName') as string) || '';
    const location = (formData.get('location') as string) || '';
    const descriptionHi = (formData.get('descriptionHi') as string) || '';
    const descriptionEn = (formData.get('descriptionEn') as string) || '';
    const date = (formData.get('date') as string) || new Date().toISOString().slice(0, 10);

    const file = formData.get('image') as File | null;
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      const image = await saveUploadedFile(file, 'events');
      await pool.query(
        `UPDATE events 
         SET eventName = ?, location = ?, descriptionHi = ?, descriptionEn = ?, date = ?, image = ? 
         WHERE id = ?`,
        [eventName, location, descriptionHi, descriptionEn, date, image, id]
      );
    } else {
      await pool.query(
        `UPDATE events 
         SET eventName = ?, location = ?, descriptionHi = ?, descriptionEn = ?, date = ? 
         WHERE id = ?`,
        [eventName, location, descriptionHi, descriptionEn, date, id]
      );
    }

    return NextResponse.json({ success: true, message: 'Event updated successfully' });
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
