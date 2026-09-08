import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { pool } from './db/index.js';
import { computeStatus } from './lib/ticketLogic.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  app.use(express.json());

  const requireAdmin = (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const expected = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
    const provided = crypto.createHash('sha256').update(token).digest('hex');

    if (provided.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    next();
  };

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/auth/admin', (req, res) => {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }
    if (password === ADMIN_PASSWORD) {
      return res.json({ ok: true, token: ADMIN_PASSWORD });
    }
    return res.status(401).json({ ok: false, error: 'Mot de passe incorrect' });
  });

  app.post('/api/verify', async (req, res) => {
    try {
      const { code } = req.body || {};

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, error: 'Code manquant' });
      }

      const cleaned = code.replace(/[\s.-]/g, '').trim();

      if (cleaned.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Le code saisi est trop court. Veuillez vérifier et réessayer.',
        });
      }

      const ticket = computeStatus(cleaned);

      await pool.query(
        `INSERT INTO tickets (code, type, amount, status, last_used, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          ticket.code,
          ticket.type,
          ticket.amount,
          ticket.status,
          ticket.lastUsed ?? null,
          ticket.expiryDate ?? null,
        ]
      );

      return res.json({ success: true, ticket });
    } catch (err) {
      console.error('Erreur /api/verify:', err);
      return res.status(500).json({ success: false, error: 'Erreur serveur. Veuillez réessayer.' });
    }
  });

  app.get('/api/admin/tickets', requireAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, code, type, amount, status, last_used, expiry_date, verified_at
         FROM tickets
         ORDER BY verified_at DESC
         LIMIT 500`
      );
      return res.json({ tickets: result.rows });
    } catch (err) {
      console.error('Erreur /api/admin/tickets:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'valid') AS valid,
           COUNT(*) FILTER (WHERE status = 'used') AS used,
           COUNT(*) FILTER (WHERE status = 'expired') AS expired,
           COALESCE(SUM(amount) FILTER (WHERE status = 'valid'), 0) AS total_valid_amount
         FROM tickets`
      );
      return res.json({ stats: result.rows[0] });
    } catch (err) {
      console.error('Erreur /api/admin/stats:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  return app;
}