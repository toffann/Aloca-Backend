const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Health check
router.get('/health', healthController.checkHealth);

// Feature routes
router.use('/auth',      require('./auth.routes'));
router.use('/kantong',   require('./kantong.routes'));
router.use('/transaksi', require('./transaksi.routes'));
router.use('/kategori',  require('./kategori.routes'));
router.use('/admin',     require('./admin.routes'));

module.exports = router;
