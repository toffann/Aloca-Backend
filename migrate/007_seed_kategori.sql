-- ============================================================
-- SEED: Kategori Pemasukan & Pengeluaran
-- File   : 007_seed_kategori.sql
-- Tujuan : Mengisi data kategori awal agar user bisa langsung
--          mencatat transaksi tanpa harus buat kategori dulu
--
-- JALANKAN SETELAH: 002_create_kategori_tables.sql
-- ============================================================

-- ── Kategori Pemasukan ────────────────────────────────────────
INSERT IGNORE INTO kategori_pemasukan (nama, icon_url) VALUES
  ('Gaji',      NULL),
  ('Bonus',     NULL),
  ('Freelance', NULL);

-- ── Kategori Pengeluaran ──────────────────────────────────────
INSERT IGNORE INTO kategori_pengeluaran (nama, icon_url) VALUES
  ('Makan',          NULL),
  ('Transportasi',   NULL),
  ('Belanja',        NULL),
  ('Listrik/Air',    NULL);
