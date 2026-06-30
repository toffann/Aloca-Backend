const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * POST /api/auth/register
 * Mendaftarkan user baru dan membuat kantong "Utama" secara otomatis.
 */
const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return errorResponse(res, 'Username, email, dan password wajib diisi.', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Cek duplikasi email / username
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return errorResponse(res, 'Email atau username sudah terdaftar.', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const [userResult] = await conn.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );
    const userId = userResult.insertId;

    // Buat kantong "Utama" otomatis
    const [kantongResult] = await conn.query(
      'INSERT INTO kantong (user_id, nama, deskripsi, is_default) VALUES (?, ?, ?, ?)',
      [userId, 'Utama', 'Kantong utama', 1]
    );

    // Inisialisasi saldo 0 untuk kantong utama
    await conn.query(
      'INSERT INTO saldo (kantong_id, jumlah) VALUES (?, ?)',
      [kantongResult.insertId, 0]
    );

    await conn.commit();
    return successResponse(res, 'Registrasi berhasil.', { user_id: userId }, 201);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * POST /api/auth/login
 * Login dan mengembalikan JWT token.
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email dan password wajib diisi.', 400);
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Email atau password salah.', 401);
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Email atau password salah.', 401);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return successResponse(res, 'Login berhasil.', {
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
