import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminLogin,
  adminGetTickets,
  adminGetStats,
  type AdminTicket,
  type AdminStats,
} from './api';
import './Admin.css';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  valid: { label: 'Valide', className: 'st-valid' },
  used: { label: 'Utilisé', className: 'st-used' },
  expired: { label: 'Expiré', className: 'st-expired' },
  invalid: { label: 'Invalide', className: 'st-invalid' },
};

export default function Admin() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('admin_token')
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(token));
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (t: string) => {
    try {
      const [ticketList, statsData] = await Promise.all([
        adminGetTickets(t),
        adminGetStats(t),
      ]);
      setTickets(ticketList);
      setStats(statsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
      setToken(null);
      sessionStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => loadData(token), 0);
      return () => clearTimeout(timer);
    }
  }, [token, loadData]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError(null);
      try {
        const t = await adminLogin(password);
        sessionStorage.setItem('admin_token', t);
        setToken(t);
        setLoading(true);
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : 'Erreur de connexion');
      }
    },
    [password]
  );

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('admin_token');
    setToken(null);
    setTickets([]);
    setStats(null);
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  if (!token) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <Link to="/" className="back-link">&larr; Retour au site</Link>
        </div>
        <div className="admin-login">
          <h1>Espace Admin</h1>
          <p>Connectez-vous pour consulter les tickets enregistrés.</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe admin"
              autoFocus
            />
            {loginError && <div className="admin-error">{loginError}</div>}
            <button type="submit" disabled={!password}>
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-inner">
          <Link to="/" className="back-link">&larr; Retour au site</Link>
          <h1>Administration — Tickets</h1>
          <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </div>

      <div className="admin-body">
        {error && <div className="admin-error banner">{error}</div>}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card valid">
              <span className="stat-value">{stats.valid}</span>
              <span className="stat-label">Valides</span>
            </div>
            <div className="stat-card used">
              <span className="stat-value">{stats.used}</span>
              <span className="stat-label">Utilisés</span>
            </div>
            <div className="stat-card expired">
              <span className="stat-value">{stats.expired}</span>
              <span className="stat-label">Expirés</span>
            </div>
            <div className="stat-card amount">
              <span className="stat-value">{stats.total_valid_amount} &euro;</span>
              <span className="stat-label">Valeur valide</span>
            </div>
          </div>
        )}

        <div className="table-card">
          <div className="table-title">
            <h2>Derniers tickets vérifiés</h2>
            {loading && <span className="table-loading">Chargement...</span>}
          </div>
          {tickets.length === 0 ? (
            <p className="empty-state">Aucun ticket enregistré pour le moment.</p>
          ) : (
            <div className="table-wrap">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Vérifié le</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td className="mono">{t.code}</td>
                      <td>{t.type}</td>
                      <td>{t.amount} &euro;</td>
                      <td>
                        <span className={`status-badge ${STATUS_LABELS[t.status]?.className || ''}`}>
                          {STATUS_LABELS[t.status]?.label || t.status}
                        </span>
                      </td>
                      <td>{formatDate(t.verified_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
