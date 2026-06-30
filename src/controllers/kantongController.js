const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/kantong
 * Mengambil semua kantong milik user yang sedang login, beserta saldo terkini.
 */
const getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT k.id, k.nama, k.deskripsi, k.goal, k.is_default,
              COALESCE(s.jumlah, 0) AS saldo
       FROM kantong k
       LEFT JOIN saldo s ON s.kantong_id = k.id
       WHERE k.user_id = ?
       ORDER BY k.is_default DESC, k.created_at ASC`,
      [req.user.id]
    );
    return successResponse(res, 'Data kantong berhasil diambil.', rows);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/kantong
 * Membuat kantong baru untuk user yang sedang login.
 */
const create = async (req, res, next) => {
  const { nama, deskripsi, goal } = req.body;
  if (!nama) return errorResponse(res, 'Nama kantong wajib diisi.', 400);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO kantong (user_id, nama, deskripsi, goal) VALUES (?, ?, ?, ?)',
      [req.user.id, nama, deskripsi || null, goal || 0]
    );
    await conn.query('INSERT INTO saldo (kantong_id, jumlah) VALUES (?, ?)', [result.insertId, 0]);

    await conn.commit();
    return successResponse(res, 'Kantong berhasil dibuat.', { id: result.insertId }, 201);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * PUT /api/kantong/:id
 * Mengedit kantong milik user.
 */
const update = async (req, res, next) => {
  const { id } = req.params;
  const { nama, deskripsi, goal } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM kantong WHERE id = ? AND user_id = ? LIMIT 1',
      [id, req.user.id]
    );
    if (existing.length === 0) {
      return errorResponse(res, 'Kantong tidak ditemukan.', 404);
    }

    await pool.query(
      'UPDATE kantong SET nama = COALESCE(?, nama), deskripsi = COALESCE(?, deskripsi), goal = COALESCE(?, goal) WHERE id = ?',
      [nama || null, deskripsi || null, goal !== undefined ? goal : null, id]
    );

    return successResponse(res, 'Kantong berhasil diperbarui.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/kantong/:id
 * Menghapus kantong (tidak bisa menghapus kantong default).
 */
const remove = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query(
      'SELECT id, is_default FROM kantong WHERE id = ? AND user_id = ? LIMIT 1',
      [id, req.user.id]
    );
    if (existing.length === 0) return errorResponse(res, 'Kantong tidak ditemukan.', 404);
    if (existing[0].is_default) return errorResponse(res, 'Kantong utama tidak bisa dihapus.', 400);

    await pool.query('DELETE FROM kantong WHERE id = ?', [id]);
    return successResponse(res, 'Kantong berhasil dihapus.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove };
