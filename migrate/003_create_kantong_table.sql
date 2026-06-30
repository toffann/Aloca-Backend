-- Tabel kantong milik setiap user
-- Setiap user memiliki minimal satu kantong default ("Utama")
CREATE TABLE IF NOT EXISTS kantong (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT DEFAULT NULL,
    goal DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Target saldo yang ingin dicapai pada kantong ini',
    is_default TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = kantong utama yang otomatis dibuat saat register',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_kantong_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
