export type TicketType = 'transcash' | 'pcs' | 'neosurf';

export type VerificationStatus = 'valid' | 'used' | 'invalid' | 'expired';

export interface TicketInfo {
  type: TicketType;
  amount: number;
  status: VerificationStatus;
  code: string;
  lastUsed?: string;
  expiryDate?: string;
}

export interface VerificationResult {
  success: boolean;
  ticket?: TicketInfo;
  error?: string;
}
