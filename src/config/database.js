const mysql = require('mysql2/promise');
require('dotenv').config();

// Membuat connection pool agar koneksi lebih efisien dan bisa dipakai ulang
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'aloca_user',
  password: process.env.DB_PASSWORD || 'aloca_password_123',
  database: process.env.DB_NAME     || 'aloca_management_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Menguji koneksi ke database saat server pertama kali dijalankan.
 * Jika gagal, proses akan berhenti agar masalah terdeteksi lebih awal.
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Koneksi ke database MySQL berhasil.');
    connection.release();
  } catch (err) {
    console.error('❌ Koneksi ke database MySQL gagal:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
