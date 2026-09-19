import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFiles } from '@/lib/upload-helper';

export async function GET() {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, title, titleHi, image, category, created_at FROM gallery ORDER BY id DESC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fetch gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let title = '';
    let titleHi = '';
    let category = 'General';
    let finalImages: string[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      title = body.title || body.captionEn || 'Untitled';
      titleHi = body.titleHi || body.captionHi || title;
      category = body.category || 'General';
      if (body.imageUrl) {
        finalImages = [body.imageUrl];
      }
    } else {
      const formData = await req.formData();
      title = (formData.get('title') as string) || (formData.get('captionEn') as string) || 'Untitled';
      titleHi = (formData.get('titleHi') as string) || (formData.get('captionHi') as string) || title;
      category = (formData.get('category') as string) || 'General';

      const files = formData.getAll('gallery') as File[];
      finalImages = await saveUploadedFiles(files, 'gallery');

      const singleUrl = formData.get('imageUrl') as string;
      if (singleUrl && finalImages.length === 0) {
        finalImages = [singleUrl];
      }
    }

    const imageJson = JSON.stringify(finalImages);

    const [result] = await pool.query<any>(
      'INSERT INTO gallery (title, titleHi, image, category) VALUES (?, ?, ?, ?)',
      [title, titleHi, imageJson, category]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Gallery item uploaded successfully',
        id: result.insertId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
