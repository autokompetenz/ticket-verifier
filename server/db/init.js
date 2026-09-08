import 'dotenv/config';
import { pool } from './index.js';

async function init() {
  console.log('Initialisation de la base de données...');
  console.log('Connexion à :', process.env.DATABASE_URL?.split('@')[1] ?? '(pas de DATABASE_URL)');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        code VARCHAR(64) NOT NULL,
        type VARCHAR(16) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(16) NOT NULL,
        first_name VARCHAR(64),
        last_name VARCHAR(64),
        email VARCHAR(128),
        last_used TEXT,
        expiry_date TEXT,
        verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS first_name VARCHAR(64);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS last_name VARCHAR(64);
      ALTER TABLE tickets ADD COLUMN IF NOT EXISTS email VARCHAR(128);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(code);
      CREATE INDEX IF NOT EXISTS idx_tickets_verified_at ON tickets(verified_at DESC);
    `);

    console.log('✔ Table "tickets" prête.');
  } catch (err) {
    console.error('✖ Erreur lors de l\'initialisation :', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
