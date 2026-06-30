-- Tabel log transaksi: mencatat setiap aktivitas keuangan user
-- Tipe transaksi: 'pemasukan', 'pengeluaran', 'pindah_saldo'
CREATE TABLE IF NOT EXISTS log_transaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    kantong_id INT NOT NULL COMMENT 'Kantong yang menjadi sumber atau tujuan utama transaksi',
    kantong_tujuan_id INT DEFAULT NULL COMMENT 'Diisi hanya jika tipe = pindah_saldo',
    kategori_pemasukan_id INT DEFAULT NULL,
    kategori_pengeluaran_id INT DEFAULT NULL,
    tipe ENUM('pemasukan', 'pengeluaran', 'pindah_saldo') NOT NULL,
    jumlah DECIMAL(15, 2) NOT NULL,
    catatan TEXT DEFAULT NULL,
    tanggal DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_kantong FOREIGN KEY (kantong_id) REFERENCES kantong(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_kantong_tujuan FOREIGN KEY (kantong_tujuan_id) REFERENCES kantong(id) ON DELETE SET NULL,
    CONSTRAINT fk_log_kategori_pemasukan FOREIGN KEY (kategori_pemasukan_id) REFERENCES kategori_pemasukan(id) ON DELETE SET NULL,
    CONSTRAINT fk_log_kategori_pengeluaran FOREIGN KEY (kategori_pengeluaran_id) REFERENCES kategori_pengeluaran(id) ON DELETE SET NULL
);
