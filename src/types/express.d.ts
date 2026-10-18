export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      roles?: number | null;
    }
  }
}

