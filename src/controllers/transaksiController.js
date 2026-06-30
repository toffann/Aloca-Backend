const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/transaksi
 * Mengambil riwayat log transaksi milik user, dengan filter opsional.
 * Query params: ?kantong_id=&tipe=&limit=20&offset=0
 */
const getLog = async (req, res, next) => {
  const { kantong_id, tipe, limit = 20, offset = 0 } = req.query;

  let query = `
    SELECT lt.id, lt.tipe, lt.jumlah, lt.catatan, lt.tanggal,
           k.nama AS kantong_nama,
           kt.nama AS kantong_tujuan_nama,
           kp.nama AS kategori_pemasukan,
           kpen.nama AS kategori_pengeluaran
    FROM log_transaksi lt
    JOIN kantong k ON k.id = lt.kantong_id
    LEFT JOIN kantong kt ON kt.id = lt.kantong_tujuan_id
    LEFT JOIN kategori_pemasukan kp ON kp.id = lt.kategori_pemasukan_id
    LEFT JOIN kategori_pengeluaran kpen ON kpen.id = lt.kategori_pengeluaran_id
    WHERE lt.user_id = ?
  `;
  const params = [req.user.id];

  if (kantong_id) { query += ' AND lt.kantong_id = ?'; params.push(kantong_id); }
  if (tipe)       { query += ' AND lt.tipe = ?';       params.push(tipe); }

  query += ' ORDER BY lt.tanggal DESC, lt.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [rows] = await pool.query(query, params);
    return successResponse(res, 'Riwayat transaksi berhasil diambil.', rows);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/transaksi/pemasukan
 * Mencatat pemasukan: menambah saldo kantong dan menyimpan log.
 */
const pemasukan = async (req, res, next) => {
  const { kantong_id, kategori_pemasukan_id, jumlah, catatan, tanggal } = req.body;

  if (!kantong_id || !kategori_pemasukan_id || !jumlah || !tanggal) {
    return errorResponse(res, 'kantong_id, kategori_pemasukan_id, jumlah, dan tanggal wajib diisi.', 400);
  }
  if (parseFloat(jumlah) <= 0) return errorResponse(res, 'Jumlah harus lebih dari 0.', 400);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Pastikan kantong milik user ini
    const [kantong] = await conn.query(
      'SELECT id FROM kantong WHERE id = ? AND user_id = ? LIMIT 1',
      [kantong_id, req.user.id]
    );
    if (kantong.length === 0) { await conn.rollback(); return errorResponse(res, 'Kantong tidak ditemukan.', 404); }

    await conn.query('UPDATE saldo SET jumlah = jumlah + ? WHERE kantong_id = ?', [jumlah, kantong_id]);
    const [result] = await conn.query(
      'INSERT INTO log_transaksi (user_id, kantong_id, kategori_pemasukan_id, tipe, jumlah, catatan, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, kantong_id, kategori_pemasukan_id, 'pemasukan', jumlah, catatan || null, tanggal]
    );

    await conn.commit();
    return successResponse(res, 'Pemasukan berhasil dicatat.', { id: result.insertId }, 201);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * POST /api/transaksi/pengeluaran
 * Mencatat pengeluaran: mengurangi saldo kantong dan menyimpan log.
 */
const pengeluaran = async (req, res, next) => {
  const { kantong_id, kategori_pengeluaran_id, jumlah, catatan, tanggal } = req.body;

  if (!kantong_id || !kategori_pengeluaran_id || !jumlah || !tanggal) {
    return errorResponse(res, 'kantong_id, kategori_pengeluaran_id, jumlah, dan tanggal wajib diisi.', 400);
  }
  if (parseFloat(jumlah) <= 0) return errorResponse(res, 'Jumlah harus lebih dari 0.', 400);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [saldo] = await conn.query(
      'SELECT s.jumlah FROM saldo s JOIN kantong k ON k.id = s.kantong_id WHERE s.kantong_id = ? AND k.user_id = ? LIMIT 1',
      [kantong_id, req.user.id]
    );
    if (saldo.length === 0) { await conn.rollback(); return errorResponse(res, 'Kantong tidak ditemukan.', 404); }
    if (parseFloat(saldo[0].jumlah) < parseFloat(jumlah)) {
      await conn.rollback();
      return errorResponse(res, 'Saldo tidak mencukupi.', 400);
    }

    await conn.query('UPDATE saldo SET jumlah = jumlah - ? WHERE kantong_id = ?', [jumlah, kantong_id]);
    const [result] = await conn.query(
      'INSERT INTO log_transaksi (user_id, kantong_id, kategori_pengeluaran_id, tipe, jumlah, catatan, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, kantong_id, kategori_pengeluaran_id, 'pengeluaran', jumlah, catatan || null, tanggal]
    );

    await conn.commit();
    return successResponse(res, 'Pengeluaran berhasil dicatat.', { id: result.insertId }, 201);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * POST /api/transaksi/pindah-saldo
 * Memindahkan saldo antar kantong milik user yang sama.
 */
const pindahSaldo = async (req, res, next) => {
  const { kantong_asal_id, kantong_tujuan_id, jumlah, catatan, tanggal } = req.body;

  if (!kantong_asal_id || !kantong_tujuan_id || !jumlah || !tanggal) {
    return errorResponse(res, 'kantong_asal_id, kantong_tujuan_id, jumlah, dan tanggal wajib diisi.', 400);
  }
  if (kantong_asal_id === kantong_tujuan_id) {
    return errorResponse(res, 'Kantong asal dan tujuan tidak boleh sama.', 400);
  }
  if (parseFloat(jumlah) <= 0) return errorResponse(res, 'Jumlah harus lebih dari 0.', 400);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validasi kedua kantong milik user ini
    const [kantongs] = await conn.query(
      'SELECT k.id, s.jumlah AS saldo FROM kantong k JOIN saldo s ON s.kantong_id = k.id WHERE k.id IN (?, ?) AND k.user_id = ?',
      [kantong_asal_id, kantong_tujuan_id, req.user.id]
    );
    if (kantongs.length < 2) { await conn.rollback(); return errorResponse(res, 'Satu atau kedua kantong tidak ditemukan.', 404); }

    const asal = kantongs.find(k => k.id == kantong_asal_id);
    if (parseFloat(asal.saldo) < parseFloat(jumlah)) {
      await conn.rollback();
      return errorResponse(res, 'Saldo kantong asal tidak mencukupi.', 400);
    }

    await conn.query('UPDATE saldo SET jumlah = jumlah - ? WHERE kantong_id = ?', [jumlah, kantong_asal_id]);
    await conn.query('UPDATE saldo SET jumlah = jumlah + ? WHERE kantong_id = ?', [jumlah, kantong_tujuan_id]);
    const [result] = await conn.query(
      'INSERT INTO log_transaksi (user_id, kantong_id, kantong_tujuan_id, tipe, jumlah, catatan, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, kantong_asal_id, kantong_tujuan_id, 'pindah_saldo', jumlah, catatan || null, tanggal]
    );

    await conn.commit();
    return successResponse(res, 'Pindah saldo berhasil.', { id: result.insertId }, 201);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

module.exports = { getLog, pemasukan, pengeluaran, pindahSaldo };
