const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const helloController = require('../controllers/helloController');

// Define API routes
router.get('/health', healthController.checkHealth);

// Dummy API for testing
router.get('/hello', helloController.getHello);

// Export router
module.exports = router;