const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { testConnection } = require('./config/database');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['https://aloca-frontend.vercel.app', 'https://alocaid.vercel.app'];

console.log(`CORS origins didefinisikan untuk:`, allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Akses diblokir oleh kebijakan CORS Aloca'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Tambahkan OPTIONS di sini
  credentials: true,
  optionsSuccessStatus: 200 // Memastikan respon legacy browser (IE11) aman
};

// Pasang middleware CORS untuk semua rute
app.use(cors(corsOptions));

// JAWABAN UNTUK PREFLIGHT REQUEST: Otomatis setujui request OPTIONS sebelum masuk ke router
app.options('*', cors(corsOptions));

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
  await testConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Aloca berjalan di port ${PORT}`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();