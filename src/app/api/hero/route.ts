import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFile } from '@/lib/upload-helper';

export async function GET() {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, imageUrl, description, display_order, createdAt FROM hero_slides ORDER BY display_order ASC, id DESC'
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fetch hero slides error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const description = (formData.get('subtitle') as string) || (formData.get('description') as string) || '';
    const displayOrderStr = (formData.get('display_order') as string) || '0';
    const displayOrder = parseInt(displayOrderStr, 10) || 0;

    let imageUrl = (formData.get('imageUrl') as string) || '';
    const file = formData.get('hero') as File | null;
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      imageUrl = await saveUploadedFile(file, 'hero');
    }

    const [result] = await pool.query<any>(
      'INSERT INTO hero_slides (imageUrl, description, display_order) VALUES (?, ?, ?)',
      [imageUrl, description, displayOrder]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Hero slide created',
        id: result.insertId,
        imageUrl,
        description,
        display_order: displayOrder
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create hero slide error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
