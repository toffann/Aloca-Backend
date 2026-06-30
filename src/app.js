const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { testConnection } = require('./config/database');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

// Log the CORS_ORIGIN for debugging
const corsOrigin = process.env.CORS_ORIGIN;
console.log(`CORS origin(s) configured for: ${corsOrigin || 'ANY (*)'}`);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = (corsOrigin || '').split(',');

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: The origin ${origin} is not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
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
