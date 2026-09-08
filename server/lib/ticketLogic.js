const TYPE_PREFIXES = {
  itunes: /^IT/,
  steam: /^ST/,
  cryptonow: /^CN/,
  pcs: /^PCS/,
  transcash: /^TC/,
};

export function detectTicketType(code) {
  const cleaned = code.replace(/[\s.-]/g, '').toUpperCase();

  if (/^\d{12}$/.test(cleaned)) return 'transcash';
  if (/^\d{14}$/.test(cleaned)) return 'pcs';
  if (/^\d{10}$/.test(cleaned)) return 'neosurf';
  if (/^\d{4}-\d{4}-\d{4}$/.test(code.trim())) return 'transcash';

  for (const [type, re] of Object.entries(TYPE_PREFIXES)) {
    if (re.test(cleaned)) return type;
  }

  return null;
}

export function formatCode(code) {
  const cleaned = code.replace(/[\s.-]/g, '');
  if (cleaned.length === 12) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return code;
}

export function buildPendingTicket(code, type, amount) {
  return {
    code,
    type,
    amount: Number(amount),
    status: 'pending',
  };
}