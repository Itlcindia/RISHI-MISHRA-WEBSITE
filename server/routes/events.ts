import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { uploadEvents } from '../upload.js';

const router = Router();

// GET all events
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, eventName, location, date, descriptionHi, descriptionEn, image, createdAt FROM events ORDER BY date DESC, id DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Fetch events error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single event by id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<any[]>(
      'SELECT id, eventName, location, date, descriptionHi, descriptionEn, image, createdAt FROM events WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(rows[0]);
  } catch (error: any) {
    console.error('Fetch single event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new event
router.post('/', uploadEvents.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventName, location, descriptionHi, descriptionEn, date } = req.body;
    const image = req.file ? req.file.filename : (req.body.image || null);

    const [result] = await pool.query<any>(
      `INSERT INTO events (eventName, location, descriptionHi, descriptionEn, date, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventName, location, descriptionHi, descriptionEn, date, image]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      id: result.insertId
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update event
router.put('/:id', uploadEvents.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { eventName, location, descriptionHi, descriptionEn, date } = req.body;

    if (req.file) {
      const image = req.file.filename;
      await pool.query(
        `UPDATE events 
         SET eventName = ?, location = ?, descriptionHi = ?, descriptionEn = ?, date = ?, image = ? 
         WHERE id = ?`,
        [eventName, location, descriptionHi, descriptionEn, date, image, id]
      );
    } else {
      await pool.query(
        `UPDATE events 
         SET eventName = ?, location = ?, descriptionHi = ?, descriptionEn = ?, date = ? 
         WHERE id = ?`,
        [eventName, location, descriptionHi, descriptionEn, date, id]
      );
    }

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error: any) {
    console.error('Update event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE event
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
