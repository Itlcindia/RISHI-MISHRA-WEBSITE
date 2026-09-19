import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFiles } from '@/lib/upload-helper';

export async function GET() {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, titleEn, contentEn, titleHi, contentHi, category, created_at, updated_at, images, publishDate FROM news ORDER BY publishDate DESC, id DESC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fetch news error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const titleEn = (formData.get('titleEn') as string) || '';
    const titleHi = (formData.get('titleHi') as string) || '';
    const contentEn = (formData.get('contentEn') as string) || '';
    const contentHi = (formData.get('contentHi') as string) || '';
    const category = (formData.get('category') as string) || 'General';
    const publishDate = (formData.get('publishDate') as string) || new Date().toISOString();

    const files = formData.getAll('news') as File[];
    const uploadedImages = await saveUploadedFiles(files, 'news');
    const imagesJson = JSON.stringify(uploadedImages);

    const [result] = await pool.query<any>(
      `INSERT INTO news (titleEn, titleHi, contentEn, contentHi, category, publishDate, images) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titleEn, titleHi, contentEn, contentHi, category, publishDate, imagesJson]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'News published successfully',
        id: result.insertId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create news error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
