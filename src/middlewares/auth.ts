import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@/utils/customError';
import { UserService } from '@/components/user/user.service';
import { getAccessToken, sendTokens, verifyAccessToken } from '@/config/jwt';

const authService = new UserService();

const handleAuthError = (next: NextFunction, message = 'Unauthorized') => {
  const err = new CustomError(401, message);
  return next(err);
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies.jwt;
  const accessToken = getAccessToken(req);
  if (!accessToken || !refreshToken) {
    return handleAuthError(next);
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    Object.assign(req, { user: decoded });
    return next();
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === 'TokenExpiredError' &&
      refreshToken
    ) {
      try {
        const device = req.cookies.device;
        if (!device) {
          return handleAuthError(next);
        }
        const tokens = await authService.refreshToken(refreshToken, device);
        sendTokens(res, tokens);
        const decoded = verifyAccessToken(tokens.accessToken);
        Object.assign(req, { user: decoded, device });
        return next();
      } catch (error) {
        return handleAuthError(next);
      }
    }
    return handleAuthError(next);
  }
};
