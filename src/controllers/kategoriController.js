const path = require('path');
const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── PEMASUKAN ────────────────────────────────────────────────────────────────

const getAllPemasukan = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori_pemasukan ORDER BY nama ASC');
    return successResponse(res, 'Kategori pemasukan berhasil diambil.', rows);
  } catch (err) { next(err); }
};

const createPemasukan = async (req, res, next) => {
  const { nama } = req.body;
  if (!nama) return errorResponse(res, 'Nama kategori wajib diisi.', 400);

  const icon_url = req.file
    ? `/uploads/icons/${req.file.filename}`
    : null;

  try {
    const [result] = await pool.query(
      'INSERT INTO kategori_pemasukan (nama, icon_url) VALUES (?, ?)',
      [nama, icon_url]
    );
    return successResponse(res, 'Kategori pemasukan berhasil dibuat.', { id: result.insertId }, 201);
  } catch (err) { next(err); }
};

const updatePemasukan = async (req, res, next) => {
  const { id } = req.params;
  const { nama } = req.body;
  const icon_url = req.file ? `/uploads/icons/${req.file.filename}` : undefined;

  try {
    const sets = [];
    const params = [];
    if (nama)     { sets.push('nama = ?');     params.push(nama); }
    if (icon_url) { sets.push('icon_url = ?'); params.push(icon_url); }

    if (sets.length === 0) return errorResponse(res, 'Tidak ada data yang diubah.', 400);

    params.push(id);
    await pool.query(`UPDATE kategori_pemasukan SET ${sets.join(', ')} WHERE id = ?`, params);
    return successResponse(res, 'Kategori pemasukan berhasil diperbarui.');
  } catch (err) { next(err); }
};

const deletePemasukan = async (req, res, next) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kategori_pemasukan WHERE id = ?', [id]);
    return successResponse(res, 'Kategori pemasukan berhasil dihapus.');
  } catch (err) { next(err); }
};

// ─── PENGELUARAN ──────────────────────────────────────────────────────────────

const getAllPengeluaran = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori_pengeluaran ORDER BY nama ASC');
    return successResponse(res, 'Kategori pengeluaran berhasil diambil.', rows);
  } catch (err) { next(err); }
};

const createPengeluaran = async (req, res, next) => {
  const { nama } = req.body;
  if (!nama) return errorResponse(res, 'Nama kategori wajib diisi.', 400);

  const icon_url = req.file ? `/uploads/icons/${req.file.filename}` : null;

  try {
    const [result] = await pool.query(
      'INSERT INTO kategori_pengeluaran (nama, icon_url) VALUES (?, ?)',
      [nama, icon_url]
    );
    return successResponse(res, 'Kategori pengeluaran berhasil dibuat.', { id: result.insertId }, 201);
  } catch (err) { next(err); }
};

const updatePengeluaran = async (req, res, next) => {
  const { id } = req.params;
  const { nama } = req.body;
  const icon_url = req.file ? `/uploads/icons/${req.file.filename}` : undefined;

  try {
    const sets = [];
    const params = [];
    if (nama)     { sets.push('nama = ?');     params.push(nama); }
    if (icon_url) { sets.push('icon_url = ?'); params.push(icon_url); }

    if (sets.length === 0) return errorResponse(res, 'Tidak ada data yang diubah.', 400);

    params.push(id);
    await pool.query(`UPDATE kategori_pengeluaran SET ${sets.join(', ')} WHERE id = ?`, params);
    return successResponse(res, 'Kategori pengeluaran berhasil diperbarui.');
  } catch (err) { next(err); }
};

const deletePengeluaran = async (req, res, next) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kategori_pengeluaran WHERE id = ?', [id]);
    return successResponse(res, 'Kategori pengeluaran berhasil dihapus.');
  } catch (err) { next(err); }
};

module.exports = {
  getAllPemasukan, createPemasukan, updatePemasukan, deletePemasukan,
  getAllPengeluaran, createPengeluaran, updatePengeluaran, deletePengeluaran,
};
