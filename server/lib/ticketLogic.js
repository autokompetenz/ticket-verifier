const DEMO_TICKETS = {
  '1234-5678-9012': {
    type: 'transcash',
    amount: 50,
    status: 'valid',
    code: '1234-5678-9012',
    expiryDate: '12/2026',
  },
  '9876-5432-1098': {
    type: 'pcs',
    amount: 100,
    status: 'used',
    code: '9876-5432-1098',
    lastUsed: '01/09/2026 à 14:32',
  },
  '1111-2222-3333': {
    type: 'neosurf',
    amount: 25,
    status: 'expired',
    code: '1111-2222-3333',
    expiryDate: '06/2025',
  },
};

export function detectTicketType(code) {
  const cleaned = code.replace(/[\s.-]/g, '');

  if (/^\d{12}$/.test(cleaned)) return 'transcash';
  if (/^\d{14}$/.test(cleaned)) return 'pcs';
  if (/^\d{10}$/.test(cleaned)) return 'neosurf';
  if (/^\d{4}-\d{4}-\d{4}$/.test(code.trim())) return 'transcash';

  return null;
}

export function formatCode(code) {
  const cleaned = code.replace(/[\s.-]/g, '');
  if (cleaned.length === 12) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return code;
}

export function computeStatus(code) {
  const cleaned = code.replace(/[\s.-]/g, '');
  const hash = Array.from(cleaned).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  if (DEMO_TICKETS[formatCode(cleaned)]) {
    return DEMO_TICKETS[formatCode(cleaned)];
  }

  const ticketType = detectTicketType(code) || 'transcash';
  const amounts = [15, 25, 50, 75, 100, 150, 200];
  const amount = amounts[hash % amounts.length];

  if (hash % 7 === 0) {
    return {
      type: ticketType,
      amount,
      status: 'used',
      code: formatCode(cleaned),
      lastUsed: '05/09/2026 à 09:15',
    };
  }

  if (hash % 11 === 0) {
    return {
      type: ticketType,
      amount,
      status: 'expired',
      code: formatCode(cleaned),
      expiryDate: '12/2024',
    };
  }

  return {
    type: ticketType,
    amount,
    status: 'valid',
    code: formatCode(cleaned),
    expiryDate: '03/2027',
  };
}
