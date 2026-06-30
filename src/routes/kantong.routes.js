const express = require('express');
const router = express.Router();
const kantongController = require('../controllers/kantongController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken); // Semua route kantong butuh autentikasi

router.get('/',     kantongController.getAll);
router.post('/',    kantongController.create);
router.put('/:id',  kantongController.update);
router.delete('/:id', kantongController.remove);

module.exports = router;
