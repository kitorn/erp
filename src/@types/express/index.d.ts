import { DecodedToken } from '@/config/jwt';

declare global {
  namespace Express {
    interface Request {
      user: DecodedToken;
    }
  }
}
