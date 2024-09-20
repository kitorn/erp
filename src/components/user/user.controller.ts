import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { CustomError } from '@/utils/customError';
import { plainToClass } from 'class-transformer';
import { sendTokens } from '@/config/jwt';

import { CreateUserDto } from './user.dto';

import { UserService } from './user.service';

const authService = new UserService();

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, password } = req.body;
    const tokens = await authService.login(id, password);
    sendTokens(res, tokens);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const refreshTokens = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { jwt: refreshToken, device } = req.cookies;
    if (!refreshToken || !device) {
      throw new CustomError(401, 'Unauthorized');
    }
    const tokens = await authService.refreshToken(refreshToken, device);
    sendTokens(res, tokens);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const createUserDto = plainToClass(CreateUserDto, req.body);
    if (!createUserDto || JSON.stringify(createUserDto) === '{}') {
      throw new CustomError(400, 'No data provided');
    }
    const errors = await validate(createUserDto);

    if (errors.length > 0) {
      throw errors;
    }

    const tokens = await authService.register(createUserDto);
    sendTokens(res, tokens);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req?.user?.id;
    const { device } = req.cookies;
    if (!userId || !device) {
      throw new CustomError(401, 'Invalid token');
    }

    await authService.logout(userId, device);
    res.clearCookie('jwt');
    res.clearCookie('device').end();
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req?.user?.id;
    if (!userId) {
      throw new CustomError(401, 'Invalid token');
    }

    const user = await authService.getUserInfo(userId);
    if (!user) {
      throw new CustomError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};
