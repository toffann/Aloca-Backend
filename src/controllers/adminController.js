const { pool } = require('../config/database');
const { successResponse } = require('../utils/responseHelper');

/**
 * GET /api/admin/stats
 * Statistik ringkasan untuk dashboard admin.
 * Hanya bisa diakses oleh role 'admin'.
 */
const getStats = async (req, res, next) => {
  try {
    // Jalankan semua query secara paralel untuk efisiensi
    const [
      [userRows],
      [transaksiRows],
      [tipeRows],
      [katPemasukanRows],
      [katPengeluaranRows],
    ] = await Promise.all([
      // Total user terdaftar
      pool.query('SELECT COUNT(*) AS total FROM users'),

      // Total semua transaksi
      pool.query('SELECT COUNT(*) AS total FROM log_transaksi'),

      // Jumlah transaksi per tipe
      pool.query(`
        SELECT tipe, COUNT(*) AS total, SUM(jumlah) AS total_nominal
        FROM log_transaksi
        GROUP BY tipe
      `),

      // Total kategori pemasukan
      pool.query('SELECT COUNT(*) AS total FROM kategori_pemasukan'),

      // Total kategori pengeluaran
      pool.query('SELECT COUNT(*) AS total FROM kategori_pengeluaran'),
    ]);

    // Normalisasi data per-tipe ke objek yang mudah dibaca frontend
    const byTipe = { pemasukan: 0, pengeluaran: 0, pindah_saldo: 0 };
    const nominalByTipe = { pemasukan: 0, pengeluaran: 0, pindah_saldo: 0 };
    tipeRows.forEach((row) => {
      byTipe[row.tipe]        = parseInt(row.total);
      nominalByTipe[row.tipe] = parseFloat(row.total_nominal) || 0;
    });

    return successResponse(res, 'Statistik admin berhasil diambil.', {
      totalUser:         parseInt(userRows[0].total),
      totalTransaksi:    parseInt(transaksiRows[0].total),
      totalKategoriPemasukan:   parseInt(katPemasukanRows[0].total),
      totalKategoriPengeluaran: parseInt(katPengeluaranRows[0].total),
      transaksiByTipe:   byTipe,
      nominalByTipe,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
