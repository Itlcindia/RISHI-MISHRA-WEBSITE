import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { uploadInitiatives } from '../upload.js';

const router = Router();

// GET all initiatives
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, slug, titleHi, titleEn, descriptionHi, descriptionEn, image, display_order FROM initiatives ORDER BY display_order ASC, id DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Fetch initiatives error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single initiative by slug or id
router.get('/:slugOrId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slugOrId } = req.params;
    const [rows] = await pool.query<any[]>(
      'SELECT id, slug, titleHi, titleEn, descriptionHi, descriptionEn, image, display_order FROM initiatives WHERE slug = ? OR id = ? LIMIT 1',
      [slugOrId, slugOrId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Initiative not found' });
      return;
    }

    res.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch single initiative error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware for initiative upload supporting both field names
const uploadMiddleware = (req: Request, res: Response, next: any) => {
  uploadInitiatives.any()(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

// POST new initiative
router.post('/', uploadMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { titleHi, titleEn, descriptionHi, descriptionEn, slug, display_order } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;
    const file = files && files.length > 0 ? files[0] : null;
    const image = file ? file.filename : (req.body.image || null);
    const displayOrder = parseInt(display_order ?? '0', 10) || 0;

    const [result] = await pool.query<any>(
      `INSERT INTO initiatives (slug, titleHi, titleEn, descriptionHi, descriptionEn, image, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [slug, titleHi, titleEn, descriptionHi, descriptionEn, image, displayOrder]
    );

    res.status(201).json({
      success: true,
      message: 'Initiative created successfully',
      id: result.insertId
    });
  } catch (error: any) {
    console.error('Create initiative error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update initiative
router.put('/:id', uploadMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titleHi, titleEn, descriptionHi, descriptionEn, slug, display_order } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;
    const file = files && files.length > 0 ? files[0] : null;
    const displayOrder = parseInt(display_order ?? '0', 10) || 0;

    if (file) {
      const image = file.filename;
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

    res.json({ success: true, message: 'Initiative updated successfully' });
  } catch (error: any) {
    console.error('Update initiative error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE initiative
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM initiatives WHERE id = ?', [id]);
    res.json({ success: true, message: 'Initiative deleted successfully' });
  } catch (error: any) {
    console.error('Delete initiative error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
