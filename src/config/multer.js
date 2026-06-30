const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Gunakan path absolut yang konsisten baik di lokal maupun di Docker container
// Di Docker, WORKDIR adalah /app sehingga uploads akan ada di /app/uploads/icons
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), 'uploads', 'icons');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Hanya izinkan file gambar
const fileFilter = (_req, file, cb) => {
  const allowedMime = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (PNG, JPG, SVG, WebP) yang diizinkan.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maks 2 MB
});

module.exports = upload;
