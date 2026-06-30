const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { testConnection } = require('./config/database');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file icon yang diupload secara statis
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Error Handlers ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await testConnection(); // Pastikan DB siap sebelum menerima request
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Aloca berjalan di port ${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
