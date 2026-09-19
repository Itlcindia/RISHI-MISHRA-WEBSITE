import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFile } from '@/lib/upload-helper';

export async function GET() {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, slug, titleHi, titleEn, descriptionHi, descriptionEn, image, display_order FROM initiatives ORDER BY display_order ASC, id DESC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fetch initiatives error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const titleHi = (formData.get('titleHi') as string) || '';
    const titleEn = (formData.get('titleEn') as string) || '';
    const descriptionHi = (formData.get('descriptionHi') as string) || '';
    const descriptionEn = (formData.get('descriptionEn') as string) || '';
    const slug = (formData.get('slug') as string) || '';
    const displayOrderStr = (formData.get('display_order') as string) || '0';
    const displayOrder = parseInt(displayOrderStr, 10) || 0;

    let image: string | null = (formData.get('image') as string) || null;
    const file = (formData.get('initiative_img') as File | null) || (formData.get('image') as File | null);
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      image = await saveUploadedFile(file, 'initiatives');
    }

    const [result] = await pool.query<any>(
      `INSERT INTO initiatives (slug, titleHi, titleEn, descriptionHi, descriptionEn, image, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [slug, titleHi, titleEn, descriptionHi, descriptionEn, image, displayOrder]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Initiative created successfully',
        id: result.insertId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create initiative error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
