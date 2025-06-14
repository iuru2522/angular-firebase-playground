export interface AuthError extends Error {
  code?: string;
  message: string;
}
