export interface JwtPayload {
  id: string; // User ID
  email: string; // User email
  iat?: number; // Issued at timestamp (optional)
  exp?: number; // Expiration timestamp (optional)
}
