-- Tabel saldo: menyimpan saldo terkini per kantong (one-to-one dengan kantong)
CREATE TABLE IF NOT EXISTS saldo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kantong_id INT NOT NULL UNIQUE,
    jumlah DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_saldo_kantong FOREIGN KEY (kantong_id) REFERENCES kantong(id) ON DELETE CASCADE
);
