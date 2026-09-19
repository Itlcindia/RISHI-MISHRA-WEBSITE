import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFile } from '@/lib/upload-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const description = (formData.get('subtitle') as string) ?? (formData.get('description') as string) ?? '';
    const displayOrderStr = (formData.get('display_order') as string) || '0';
    const displayOrder = parseInt(displayOrderStr, 10) || 0;

    const file = formData.get('hero') as File | null;
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      const imageUrl = await saveUploadedFile(file, 'hero');
      await pool.query(
        'UPDATE hero_slides SET imageUrl = ?, description = ?, display_order = ? WHERE id = ?',
        [imageUrl, description, displayOrder, id]
      );
    } else {
      await pool.query(
        'UPDATE hero_slides SET description = ?, display_order = ? WHERE id = ?',
        [description, displayOrder, id]
      );
    }

    return NextResponse.json({ success: true, message: 'Hero slide updated successfully' });
  } catch (error: any) {
    console.error('Update hero slide error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Hero slide deleted' });
  } catch (error: any) {
    console.error('Delete hero slide error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
