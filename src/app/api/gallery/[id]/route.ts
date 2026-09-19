import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFiles } from '@/lib/upload-helper';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<any[]>(
      'SELECT id, title, titleHi, image, category, created_at FROM gallery WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch single gallery item error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const title = (formData.get('title') as string) || '';
    const titleHi = (formData.get('titleHi') as string) || '';
    const category = (formData.get('category') as string) || 'General';
    const existingImagesRaw = formData.get('existingImages') as string;

    let preservedImages: string[] = [];
    if (existingImagesRaw) {
      try {
        preservedImages = JSON.parse(existingImagesRaw);
      } catch (e) {
        preservedImages = [];
      }
    }

    const files = formData.getAll('gallery') as File[];
    const newImages = await saveUploadedFiles(files, 'gallery');
    const allImages = [...preservedImages, ...newImages];
    const imageJson = JSON.stringify(allImages);

    await pool.query(
      'UPDATE gallery SET title = ?, titleHi = ?, image = ?, category = ? WHERE id = ?',
      [title, titleHi, imageJson, category, id]
    );

    return NextResponse.json({ success: true, message: 'Gallery updated successfully' });
  } catch (error: any) {
    console.error('Update gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    console.error('Delete gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
