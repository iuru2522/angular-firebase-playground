export interface AuthError extends Error {
  code?: string;
  message: string;
}

export type AuthErrorContext = 'initialization' | 'state_change' | 'sign_out';
