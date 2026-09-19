import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { uploadHero } from '../upload.js';

const router = Router();

// GET all hero slides
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, imageUrl, description, display_order, createdAt FROM hero_slides ORDER BY display_order ASC, id DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Fetch hero slides error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new hero slide
router.post('/', uploadHero.single('hero'), async (req: Request, res: Response): Promise<void> => {
  try {
    const description = req.body.subtitle || req.body.description || '';
    const displayOrder = parseInt(req.body.display_order ?? '0', 10) || 0;
    const imageUrl = req.file ? req.file.filename : (req.body.imageUrl || '');

    const [result] = await pool.query<any>(
      'INSERT INTO hero_slides (imageUrl, description, display_order) VALUES (?, ?, ?)',
      [imageUrl, description, displayOrder]
    );

    res.status(201).json({
      success: true,
      message: 'Hero slide created',
      id: result.insertId,
      imageUrl,
      description,
      display_order: displayOrder
    });
  } catch (error: any) {
    console.error('Create hero slide error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update hero slide
router.put('/:id', uploadHero.single('hero'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const description = req.body.subtitle ?? req.body.description ?? '';
    const displayOrder = parseInt(req.body.display_order ?? '0', 10) || 0;

    if (req.file) {
      const imageUrl = req.file.filename;
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

    res.json({ success: true, message: 'Hero slide updated successfully' });
  } catch (error: any) {
    console.error('Update hero slide error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE hero slide
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);
    res.json({ success: true, message: 'Hero slide deleted' });
  } catch (error: any) {
    console.error('Delete hero slide error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
