import path from 'path';
import fs from 'fs/promises';

export async function saveUploadedFile(file: File, subFolder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const targetDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
  await fs.mkdir(targetDir, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(targetDir, filename);

  await fs.writeFile(filePath, buffer);
  return filename;
}

export async function saveUploadedFiles(files: File[], subFolder: string): Promise<string[]> {
  const filenames: string[] = [];
  for (const file of files) {
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      const name = await saveUploadedFile(file, subFolder);
      filenames.push(name);
    }
  }
  return filenames;
}
