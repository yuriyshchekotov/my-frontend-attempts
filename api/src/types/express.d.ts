import { AuthTokenPayload } from '@frontend-learning/shared';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};

