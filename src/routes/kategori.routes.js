const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// ── Kategori Pemasukan ────────────────────────────────────────────────────────
// GET  → semua user login boleh baca (untuk form transaksi)
// POST / PUT / DELETE → admin only
router.get('/pemasukan',
  verifyToken,
  kategoriController.getAllPemasukan
);
router.post('/pemasukan',
  verifyToken, verifyAdmin,
  upload.single('icon'),
  kategoriController.createPemasukan
);
router.put('/pemasukan/:id',
  verifyToken, verifyAdmin,
  upload.single('icon'),
  kategoriController.updatePemasukan
);
router.delete('/pemasukan/:id',
  verifyToken, verifyAdmin,
  kategoriController.deletePemasukan
);

// ── Kategori Pengeluaran ──────────────────────────────────────────────────────
router.get('/pengeluaran',
  verifyToken,
  kategoriController.getAllPengeluaran
);
router.post('/pengeluaran',
  verifyToken, verifyAdmin,
  upload.single('icon'),
  kategoriController.createPengeluaran
);
router.put('/pengeluaran/:id',
  verifyToken, verifyAdmin,
  upload.single('icon'),
  kategoriController.updatePengeluaran
);
router.delete('/pengeluaran/:id',
  verifyToken, verifyAdmin,
  kategoriController.deletePengeluaran
);

module.exports = router;
