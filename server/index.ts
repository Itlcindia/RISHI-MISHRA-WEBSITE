import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { testDbConnection } from './db.js';

// Route imports
import authRoutes from './routes/auth.js';
import heroRoutes from './routes/hero.js';
import newsRoutes from './routes/news.js';
import eventsRoutes from './routes/events.js';
import initiativesRoutes from './routes/initiatives.js';
import galleryRoutes from './routes/gallery.js';
import messagesRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: true, // Allow all origins for dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directories exist
const uploadDirs = ['hero', 'news', 'events', 'initiatives', 'gallery'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), 'uploads', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Serve uploaded files statically
const uploadsRoot = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsRoot));

// Fallback for missing images from historical database dumps
const fallbackImagePath = path.join(process.cwd(), 'public', 'h.jpeg');
app.use('/uploads/:folder/:filename', (req: Request, res: Response, next: NextFunction) => {
  const filePath = path.join(uploadsRoot, req.params.folder, req.params.filename);
  if (!fs.existsSync(filePath) && fs.existsSync(fallbackImagePath)) {
    res.sendFile(fallbackImagePath);
  } else {
    next();
  }
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/initiatives', initiativesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/messages', messagesRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
  await testDbConnection();
});
