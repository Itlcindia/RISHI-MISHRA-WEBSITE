import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { uploadNews } from '../upload.js';

const router = Router();

// GET all news
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, titleEn, contentEn, titleHi, contentHi, category, created_at, updated_at, images, publishDate FROM news ORDER BY publishDate DESC, id DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Fetch news error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single news by id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<any[]>(
      'SELECT id, titleEn, contentEn, titleHi, contentHi, category, created_at, updated_at, images, publishDate FROM news WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    res.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch single news error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new article
router.post('/', uploadNews.array('news'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { titleEn, titleHi, contentEn, contentHi, category, publishDate } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;
    const imagesArray = files ? files.map(f => f.filename) : [];
    const imagesJson = JSON.stringify(imagesArray);

    const dateVal = publishDate || new Date();

    const [result] = await pool.query<any>(
      `INSERT INTO news (titleEn, titleHi, contentEn, contentHi, category, publishDate, images) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titleEn, titleHi, contentEn, contentHi, category || 'General', dateVal, imagesJson]
    );

    res.status(201).json({
      success: true,
      message: 'News published successfully',
      id: result.insertId
    });
  } catch (error: any) {
    console.error('Create news error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update article
router.put('/:id', uploadNews.array('news'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titleEn, titleHi, contentEn, contentHi, category, publishDate } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    if (files && files.length > 0) {
      const newImages = files.map(f => f.filename);
      const imagesJson = JSON.stringify(newImages);

      await pool.query(
        `UPDATE news 
         SET titleEn = ?, titleHi = ?, contentEn = ?, contentHi = ?, category = ?, publishDate = ?, images = ? 
         WHERE id = ?`,
        [titleEn, titleHi, contentEn, contentHi, category || 'General', publishDate || new Date(), imagesJson, id]
      );
    } else {
      await pool.query(
        `UPDATE news 
         SET titleEn = ?, titleHi = ?, contentEn = ?, contentHi = ?, category = ?, publishDate = ? 
         WHERE id = ?`,
        [titleEn, titleHi, contentEn, contentHi, category || 'General', publishDate || new Date(), id]
      );
    }

    res.json({ success: true, message: 'News updated successfully' });
  } catch (error: any) {
    console.error('Update news error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE news
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM news WHERE id = ?', [id]);
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error: any) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
