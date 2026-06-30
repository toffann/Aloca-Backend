const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/',                  transaksiController.getLog);
router.post('/pemasukan',        transaksiController.pemasukan);
router.post('/pengeluaran',      transaksiController.pengeluaran);
router.post('/pindah-saldo',     transaksiController.pindahSaldo);

module.exports = router;
