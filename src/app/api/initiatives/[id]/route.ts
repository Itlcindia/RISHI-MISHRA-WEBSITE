import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { saveUploadedFile } from '@/lib/upload-helper';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<any[]>(
      'SELECT id, slug, titleHi, titleEn, descriptionHi, descriptionEn, image, display_order FROM initiatives WHERE slug = ? OR id = ? LIMIT 1',
      [id, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Initiative not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch single initiative error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const titleHi = (formData.get('titleHi') as string) || '';
    const titleEn = (formData.get('titleEn') as string) || '';
    const descriptionHi = (formData.get('descriptionHi') as string) || '';
    const descriptionEn = (formData.get('descriptionEn') as string) || '';
    const slug = (formData.get('slug') as string) || '';
    const displayOrderStr = (formData.get('display_order') as string) || '0';
    const displayOrder = parseInt(displayOrderStr, 10) || 0;

    const file = (formData.get('initiative_img') as File | null) || (formData.get('image') as File | null);
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      const image = await saveUploadedFile(file, 'initiatives');
      await pool.query(
        `UPDATE initiatives 
         SET slug = ?, titleHi = ?, titleEn = ?, descriptionHi = ?, descriptionEn = ?, image = ?, display_order = ? 
         WHERE id = ?`,
        [slug, titleHi, titleEn, descriptionHi, descriptionEn, image, displayOrder, id]
      );
    } else {
      await pool.query(
        `UPDATE initiatives 
         SET slug = ?, titleHi = ?, titleEn = ?, descriptionHi = ?, descriptionEn = ?, display_order = ? 
         WHERE id = ?`,
        [slug, titleHi, titleEn, descriptionHi, descriptionEn, displayOrder, id]
      );
    }

    return NextResponse.json({ success: true, message: 'Initiative updated successfully' });
  } catch (error: any) {
    console.error('Update initiative error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM initiatives WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Initiative deleted successfully' });
  } catch (error: any) {
    console.error('Delete initiative error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
