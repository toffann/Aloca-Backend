const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Routes and Middlewares
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Middleware dasar
app.use(cors()); // Mengizinkan frontend React terpisah untuk mengakses API ini
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup API Routes
app.use('/api', routes);

// Middleware untuk menangani 404 Not Found
app.use(notFoundHandler);

// Middleware untuk menangani Error
app.use(errorHandler);

// Port dinamis agar bisa menyesuaikan otomatis saat di-deploy ke Railway atau Docker
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server Backend berjalan di port ${PORT}`);
});