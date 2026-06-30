-- ============================================================
-- SEED: Users
-- File   : 006_seed_users.sql
-- Tujuan : Mengisi data akun demo awal
-- Password: 'password123' (bcrypt cost factor 12)
--
-- JALANKAN SETELAH: 001_create_users_table.sql
-- ============================================================

-- Gunakan INSERT IGNORE agar seed aman dijalankan ulang
-- tanpa error duplikasi jika data sudah ada sebelumnya
INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
  ('admin',  'admin@aloca.id',  '$2a$12$BIcAupUpnNkqjkxPyNGPLOKRDFaKUlnJMjfOfLCHhaaoW1c9DEvIW', 'admin'),
  ('user1',  'user1@aloca.id',  '$2a$12$BIcAupUpnNkqjkxPyNGPLOKRDFaKUlnJMjfOfLCHhaaoW1c9DEvIW', 'user'),
  ('user2',  'user2@aloca.id',  '$2a$12$BIcAupUpnNkqjkxPyNGPLOKRDFaKUlnJMjfOfLCHhaaoW1c9DEvIW', 'user');

-- Buat kantong "Utama" dan saldo awal untuk setiap user yang baru di-seed
-- Subquery memastikan kantong hanya dibuat jika belum ada
INSERT IGNORE INTO kantong (user_id, nama, deskripsi, is_default)
SELECT u.id, 'Utama', 'Kantong utama', 1
FROM users u
WHERE u.email IN ('admin@aloca.id', 'user1@aloca.id', 'user2@aloca.id')
  AND NOT EXISTS (
    SELECT 1 FROM kantong k WHERE k.user_id = u.id AND k.is_default = 1
  );

-- Inisialisasi saldo 0 untuk setiap kantong yang baru dibuat
INSERT IGNORE INTO saldo (kantong_id, jumlah)
SELECT k.id, 0
FROM kantong k
WHERE k.is_default = 1
  AND NOT EXISTS (
    SELECT 1 FROM saldo s WHERE s.kantong_id = k.id
  );
