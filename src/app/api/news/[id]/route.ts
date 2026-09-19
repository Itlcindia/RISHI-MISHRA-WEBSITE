import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFiles } from '@/lib/upload-helper';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<any[]>(
      'SELECT id, titleEn, contentEn, titleHi, contentHi, category, created_at, updated_at, images, publishDate FROM news WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch single news error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const titleEn = (formData.get('titleEn') as string) || '';
    const titleHi = (formData.get('titleHi') as string) || '';
    const contentEn = (formData.get('contentEn') as string) || '';
    const contentHi = (formData.get('contentHi') as string) || '';
    const category = (formData.get('category') as string) || 'General';
    const publishDate = (formData.get('publishDate') as string) || new Date().toISOString();

    const files = formData.getAll('news') as File[];
    const uploadedImages = await saveUploadedFiles(files, 'news');

    if (uploadedImages.length > 0) {
      const imagesJson = JSON.stringify(uploadedImages);
      await pool.query(
        `UPDATE news 
         SET titleEn = ?, titleHi = ?, contentEn = ?, contentHi = ?, category = ?, publishDate = ?, images = ? 
         WHERE id = ?`,
        [titleEn, titleHi, contentEn, contentHi, category, publishDate, imagesJson, id]
      );
    } else {
      await pool.query(
        `UPDATE news 
         SET titleEn = ?, titleHi = ?, contentEn = ?, contentHi = ?, category = ?, publishDate = ? 
         WHERE id = ?`,
        [titleEn, titleHi, contentEn, contentHi, category, publishDate, id]
      );
    }

    return NextResponse.json({ success: true, message: 'News updated successfully' });
  } catch (error: any) {
    console.error('Update news error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM news WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'News deleted successfully' });
  } catch (error: any) {
    console.error('Delete news error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
