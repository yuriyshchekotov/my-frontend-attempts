import { AuthTokenPayload, UserPublic } from '@frontend-learning/shared';

declare module 'express-session' {
  interface SessionData {
    authToken?: string;
    user?: UserPublic;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
