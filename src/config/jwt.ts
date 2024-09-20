import { User } from '@/components/user/user.entity';
import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
  device: string;
};

export type DecodedToken = {
  id: number;
  identifier: string;
  device: string;
};

export const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;
export const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;

const getPayloadForJwt = (user: User, device: string): DecodedToken => {
  return {
    id: user.id,
    identifier: user.identifier,
    device,
  };
};

// Generate access token
export const generateAccessToken = (user: User, device: string) => {
  return jwt.sign(getPayloadForJwt(user, device), ACCESS_TOKEN_SECRET, {
    expiresIn: '10m',
  });
};

// Generate refresh token
export const generateRefreshToken = (user: User, device: string) => {
  return jwt.sign(getPayloadForJwt(user, device), REFRESH_TOKEN_SECRET, {
    expiresIn: '15d',
  });
};

// Verify and decode access token
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedToken;
};

// Verify and decode refresh token
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

export const sendTokens = (res: Response, tokens: Tokens) => {
  const cookieProps = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
  res.setHeader('authorization', `Bearer ${tokens.accessToken}`);
  res.cookie('device', tokens.device, cookieProps);
  res.cookie('jwt', tokens.refreshToken, cookieProps);
};

export const getAccessToken = (req: Request) => {
  const authHeader = req.headers.authorization as string;
  const accessToken = authHeader && authHeader.split(' ')[1];
  return accessToken;
};

export const extractUserIdFromJwt = (token: string): number | null => {
  try {
    const decoded = verifyAccessToken(token);
    if (!decoded?.id) {
      return null;
    }
    return decoded?.id;
  } catch (error) {
    console.error('Failed to verify JWT:', error);
    return null;
  }
};
