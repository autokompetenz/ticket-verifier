import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    return {
      exists: false,
      message:
        'DATABASE_URL manquante. Copie .env.example vers .env et renseigne ta string de connexion Neon.',
    };
  }
  return { exists: true };
}