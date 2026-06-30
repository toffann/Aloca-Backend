const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

// Semua route admin: wajib login DAN role admin
router.get('/stats', verifyToken, verifyAdmin, adminController.getStats);

module.exports = router;
