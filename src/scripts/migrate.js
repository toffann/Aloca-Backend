const mysql = require('mysql2/promise');
const fs = require('fs/promises');
const path = require('path');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aloca_management_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

async function runMigrations() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await pool.getConnection();
    console.log('Database connected.');

    const migrateDir = path.join(__dirname, '..', '..', 'migrate');
    console.log(`Reading migration files from ${migrateDir}`);

    const files = await fs.readdir(migrateDir);
    const sqlFiles = files
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (sqlFiles.length === 0) {
      console.log('No migration files found.');
      return;
    }

    console.log('Found migration files:', sqlFiles);

    for (const file of sqlFiles) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrateDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      await connection.query(sql);
      console.log(`Migration ${file} completed.`);
    }

    console.log('All migrations ran successfully.');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
    console.log('Database connection closed.');
  }
}

runMigrations();
