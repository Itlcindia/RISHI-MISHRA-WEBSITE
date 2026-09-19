import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required' });
      return;
    }

    const [rows] = await pool.query<any[]>(
      'SELECT id, username FROM admins WHERE username = ? AND password = ? LIMIT 1',
      [username, password]
    );

    if (rows.length > 0) {
      const admin = rows[0];
      res.json({
        success: true,
        message: 'Login successful',
        admin: { id: admin.id, username: admin.username }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
  }
});

export default router;
