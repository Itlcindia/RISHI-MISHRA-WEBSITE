import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { uploadGallery } from '../upload.js';

const router = Router();

// GET all gallery items
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, title, titleHi, image, category, created_at FROM gallery ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Fetch gallery error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single gallery item
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<any[]>(
      'SELECT id, title, titleHi, image, category, created_at FROM gallery WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Gallery item not found' });
      return;
    }

    res.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch single gallery item error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new gallery item
router.post('/', uploadGallery.array('gallery'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, titleHi, category, imageUrl, captionEn, captionHi } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    let finalImages: string[] = [];
    if (files && files.length > 0) {
      finalImages = files.map(f => f.filename);
    } else if (imageUrl) {
      finalImages = [imageUrl];
    }

    const finalTitle = title || captionEn || 'Untitled';
    const finalTitleHi = titleHi || captionHi || finalTitle;
    const imageJson = JSON.stringify(finalImages);

    const [result] = await pool.query<any>(
      'INSERT INTO gallery (title, titleHi, image, category) VALUES (?, ?, ?, ?)',
      [finalTitle, finalTitleHi, imageJson, category || 'General']
    );

    res.status(201).json({
      success: true,
      message: 'Gallery item uploaded successfully',
      id: result.insertId
    });
  } catch (error: any) {
    console.error('Create gallery error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update gallery item
router.put('/:id', uploadGallery.array('gallery'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, titleHi, category, existingImages } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    let preservedImages: string[] = [];
    if (existingImages) {
      try {
        preservedImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      } catch (e) {
        preservedImages = [];
      }
    }

    const newImages = files ? files.map(f => f.filename) : [];
    const allImages = [...preservedImages, ...newImages];
    const imageJson = JSON.stringify(allImages);

    await pool.query(
      'UPDATE gallery SET title = ?, titleHi = ?, image = ?, category = ? WHERE id = ?',
      [title, titleHi || '', imageJson, category || 'General', id]
    );

    res.json({ success: true, message: 'Gallery updated successfully' });
  } catch (error: any) {
    console.error('Update gallery error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE gallery item
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    console.error('Delete gallery error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
