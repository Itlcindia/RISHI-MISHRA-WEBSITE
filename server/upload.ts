import multer from 'multer';
import path from 'path';
import fs from 'fs';

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export function createUploader(subFolder: string) {
  const targetDir = path.join(BASE_UPLOAD_DIR, subFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${uniqueSuffix}${ext}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
      // Accept images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, true); // Fallback to accept
      }
    }
  });
}

export const uploadHero = createUploader('hero');
export const uploadNews = createUploader('news');
export const uploadEvents = createUploader('events');
export const uploadInitiatives = createUploader('initiatives');
export const uploadGallery = createUploader('gallery');
