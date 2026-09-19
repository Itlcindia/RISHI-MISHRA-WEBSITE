import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET all messages
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<any[]>(
      'SELECT id, name, email, phone, message, sentAt FROM messages ORDER BY sentAt DESC, id DESC'
    );
    res.json(rows);
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new message from Contact Form
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    const [result] = await pool.query<any>(
      'INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, message]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      id: result.insertId
    });
  } catch (error: any) {
    console.error('Create message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE message
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
