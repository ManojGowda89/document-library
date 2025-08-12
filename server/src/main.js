import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9._-]/gi, '_');
}

// Allowed mimetypes for each category
const allowedTypes = {
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
  ],
  videos: [
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/webm',
    'video/quicktime',
  ],
  audio: [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/mp4',
    'audio/webm',
    'audio/aac',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/rtf',
  ],
};

// Welcome route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Media API' });
});

// Upload (Create)
router.post('/upload', async (req, res) => {
  try {
    let { type, name, base64, mimetype } = req.body;

    if (!type || !name || !base64 || !mimetype) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    type = type.toLowerCase();
    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    if (!allowedTypes[type].includes(mimetype)) {
      return res.status(400).json({ message: `Invalid mimetype for type ${type}` });
    }

    // Create folder for type if not exists
    const typeDir = path.join(UPLOAD_DIR, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    const finalName = sanitizeFilename(name);
    const filePath = path.join(typeDir, finalName);

    if (fs.existsSync(filePath)) {
      return res.status(409).json({ message: 'File with the same name already exists' });
    }

    const fileBuffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filePath, fileBuffer);

    res.json({
      message: 'File uploaded successfully',
      url: `${req.protocol}://${req.get('host')}/media/${type}/${finalName}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all files by type/category
router.get('/all/:type', (req, res) => {
  try {
    const type = req.params.type.toLowerCase();

    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const typeDir = path.join(UPLOAD_DIR, type);

    if (!fs.existsSync(typeDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(typeDir).map(file => ({
      name: file,
      url: `${req.protocol}://${req.get('host')}/api/${type}/${file}`
    }));

    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch single file by type and filename
router.get('/:type/:filename', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    const filename = req.params.filename;

    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const filePath = path.join(UPLOAD_DIR, type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete single file by type and filename
router.delete('/:type/:filename', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    const filename = req.params.filename;

    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const filePath = path.join(UPLOAD_DIR, type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all files by type/category
router.delete('/all/:type', async (req, res) => {
  try {
    const type = req.params.type.toLowerCase();

    if (!allowedTypes[type]) {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }

    const typeDir = path.join(UPLOAD_DIR, type);

    if (!fs.existsSync(typeDir)) {
      return res.json({ message: 'No files found for this type' });
    }

    const files = fs.readdirSync(typeDir);
    files.forEach(file => fs.unlinkSync(path.join(typeDir, file)));

    res.json({ message: `Deleted ${files.length} files` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
