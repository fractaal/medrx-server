namespace Express {
  interface Request {
    isAuthenticated: boolean;
    tokenData: import('firebase-admin').auth.DecodedIdToken | null;
  }
}
