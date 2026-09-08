export type TicketType = 'transcash' | 'pcs' | 'itunes' | 'neosurf' | 'steam' | 'cryptonow';

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

export interface VerifyRequest {
  code: string;
  type: TicketType;
  firstName: string;
  lastName: string;
  amount: number;
  email: string;
}
