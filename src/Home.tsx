import { useState, useCallback } from 'react';
import { verifyTicket } from './api';
import type { TicketInfo, TicketType, VerificationStatus } from './types';

const TICKET_LABELS: Record<TicketType, string> = {
  transcash: 'Transcash',
  pcs: 'PCS',
  neosurf: 'Neosurf',
};

const STATUS_CONFIG: Record<VerificationStatus, { label: string; icon: string; className: string }> = {
  valid: { label: 'Valide', icon: '\u2714', className: 'status-valid' },
  used: { label: 'Déjà utilisé', icon: '\u2716', className: 'status-used' },
  invalid: { label: 'Invalide', icon: '\u2716', className: 'status-invalid' },
  expired: { label: 'Expiré', icon: '\u23F0', className: 'status-expired' },
};

function detectTicketType(value: string): TicketType | null {
  const cleaned = value.replace(/[\s.-]/g, '');
  if (/^\d{12}$/.test(cleaned)) return 'transcash';
  if (/^\d{14}$/.test(cleaned)) return 'pcs';
  if (/^\d{10}$/.test(cleaned)) return 'neosurf';
  return null;
}

export default function Home() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<TicketType | null>(null);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCode(value);
    setResult(null);
    setError(null);
    setDetectedType(detectTicketType(value));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await verifyTicket(trimmed);
      if (response.success && response.ticket) {
        setResult(response.ticket);
      } else {
        setError(response.error || 'Une erreur est survenue lors de la vérification.');
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer (le serveur API est-il démarré ?).');
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleReset = useCallback(() => {
    setCode('');
    setResult(null);
    setError(null);
    setDetectedType(null);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#16a34a"/>
                <path d="M9 16.5L14 21.5L23 11.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="logo-text">TicketCheck</span>
          </div>
          <a href="/admin" className="admin-link">Admin</a>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">
              Vérifiez votre <span className="highlight">coupon</span> en quelques secondes
            </h1>
            <p className="hero-subtitle">
              Contrôlez l'authenticité de vos tickets Transcash, PCS et Neosurf
              avant de les utiliser. Rapide, sécurisé et 100% confidentiel.
            </p>
          </div>
        </section>

        <section className="verify-section">
          <div className="container">
            <div className="verify-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <h2>Vérifier un code</h2>
                <p>Entrez le code à 12 chiffres figurant sur votre ticket de recharge</p>
              </div>

              <form onSubmit={handleSubmit} className="verify-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="Ex: 1234 5678 9012"
                    className="code-input"
                    maxLength={16}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={loading}
                  />
                  {detectedType && (
                    <div className="type-badge">
                      {TICKET_LABELS[detectedType]}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="verify-button"
                  disabled={loading || !code.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      Vérifier le code
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="result-card result-error">
                  <div className="result-icon error">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div className="result-content">
                    <h3>Erreur</h3>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className={`result-card result-${result.status}`}>
                  <div className={`result-icon ${STATUS_CONFIG[result.status].className}`}>
                    {result.status === 'valid' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    )}
                    {result.status === 'used' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    )}
                    {result.status === 'expired' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    )}
                  </div>

                  <div className="result-content">
                    <div className="result-status">
                      <span className={`status-tag ${STATUS_CONFIG[result.status].className}`}>
                        {STATUS_CONFIG[result.status].icon} {STATUS_CONFIG[result.status].label}
                      </span>
                    </div>

                    <div className="result-details">
                      <div className="detail-row">
                        <span className="detail-label">Type</span>
                        <span className="detail-value">{TICKET_LABELS[result.type]}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Montant</span>
                        <span className="detail-value amount">{result.amount} &euro;</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Code</span>
                        <span className="detail-value mono">{result.code}</span>
                      </div>
                      {result.status === 'used' && result.lastUsed && (
                        <div className="detail-row">
                          <span className="detail-label">Dernière utilisation</span>
                          <span className="detail-value">{result.lastUsed}</span>
                        </div>
                      )}
                      {result.status === 'valid' && result.expiryDate && (
                        <div className="detail-row">
                          <span className="detail-label">Expire le</span>
                          <span className="detail-value">{result.expiryDate}</span>
                        </div>
                      )}
                      {result.status === 'expired' && result.expiryDate && (
                        <div className="detail-row">
                          <span className="detail-label">Expiré le</span>
                          <span className="detail-value">{result.expiryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button className="reset-button" onClick={handleReset}>
                    Vérifier un autre code
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2 className="section-title">Comment ça marche ?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-number">1</div>
                <h3>Saisissez votre code</h3>
                <p>Entrez le code de recharge figurant sur votre ticket Transcash, PCS ou Neosurf.</p>
              </div>
              <div className="feature-card">
                <div className="feature-number">2</div>
                <h3>Vérification instantanée</h3>
                <p>Notre système analyse votre code en temps réel et vérifie son authenticité.</p>
              </div>
              <div className="feature-card">
                <div className="feature-number">3</div>
                <h3>Résultat garanti</h3>
                <p>Recevez immédiatement le statut de votre coupon : valide, utilisé ou expiré.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="security">
          <div className="container">
            <div className="security-content">
              <div className="security-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <h2>Vos données sont protégées</h2>
              <p>
                TicketCheck ne stocke aucun de vos codes. La vérification est effectuée
                en temps réel et vos informations ne sont jamais conservées. Notre plateforme
                utilise un chiffrement SSL 256-bit pour garantir la sécurité de vos données.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon small">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="#16a34a"/>
                    <path d="M9 16.5L14 21.5L23 11.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="logo-text">TicketCheck</span>
              </div>
              <p className="footer-desc">Service de vérification de coupons prépayés. Rapide, fiable et sécurisé.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Services</h4>
                <a href="#verify">Vérifier un code</a>
                <a href="#how">Comment ça marche</a>
                <a href="#security">Sécurité</a>
              </div>
              <div className="footer-col">
                <h4>Légal</h4>
                <a href="#mentions">Mentions légales</a>
                <a href="#privacy">Politique de confidentialité</a>
                <a href="#cgv">CGV</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 TicketCheck. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
