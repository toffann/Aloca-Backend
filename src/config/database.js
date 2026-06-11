// Contoh konfigurasi database (misal: MySQL/PostgreSQL menggunakan Prisma/Sequelize)
// require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'mysql://aloca_user:aloca_password_123@localhost:3306/aloca_management_db',
    dialect: 'mysql',
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'mysql',
  }
};