import type { TicketInfo, VerificationResult } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface AdminStats {
  total: number;
  valid: number;
  used: number;
  expired: number;
  total_valid_amount: number;
}

export interface AdminTicket {
  id: number;
  code: string;
  type: string;
  amount: number;
  status: string;
  last_used: string | null;
  expiry_date: string | null;
  verified_at: string;
}

export async function verifyTicket(code: string): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  return res.json();
}

export async function adminLogin(password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Connexion échouée');
  }
  return data.token;
}

export async function adminGetStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data.stats;
}

export async function adminGetTickets(token: string): Promise<AdminTicket[]> {
  const res = await fetch(`${API_BASE}/api/admin/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data.tickets;
}

export type { TicketInfo };
