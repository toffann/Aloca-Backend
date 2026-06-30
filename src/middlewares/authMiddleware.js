const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware untuk memverifikasi JWT token dari header Authorization.
 * Menyimpan payload user ke req.user jika valid.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return errorResponse(res, 'Akses ditolak. Token tidak ditemukan.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 'Token tidak valid atau sudah kedaluwarsa.', 401);
  }
};

/**
 * Middleware untuk memastikan user yang login adalah admin.
 * Harus digunakan setelah verifyToken.
 */
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return errorResponse(res, 'Akses ditolak. Hanya admin yang diizinkan.', 403);
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
