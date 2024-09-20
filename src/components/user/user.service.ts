import { db } from '@/config/db';
import {
  generateAccessToken,
  generateRefreshToken,
  Tokens,
} from '@/config/jwt';
import { CustomError } from '@/utils/customError';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { User } from './user.entity';
import { RefreshToken } from './refreshToken.entity';
import { CreateUserDto } from './user.dto';

export class UserService {
  private userRepository = db.getRepository(User);
  private refreshTokenRepository = db.getRepository(RefreshToken);

  // Register new user and return 2 tokens
  async register(userDto: CreateUserDto): Promise<Tokens> {
    const { id, password, ...userInfo } = userDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      ...userInfo,
      identifier: id,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    const device = randomUUID();
    const accessToken = generateAccessToken(user, device);
    const refreshToken = generateRefreshToken(user, device);

    const refreshTokenEntity = new RefreshToken();
    refreshTokenEntity.token = refreshToken;
    refreshTokenEntity.device = device;
    refreshTokenEntity.user = user;
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken, device };
  }

  // Login and return 2 tokens
  async login(id: string, password: string): Promise<Tokens> {
    const user = await this.userRepository.findOne({
      where: { identifier: id },
    });
    if (!user) {
      throw new CustomError(404, 'User not found');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new CustomError(401, 'Invalid credentials');
    }

    const device = randomUUID();
    const accessToken = generateAccessToken(user, device);
    const refreshToken = generateRefreshToken(user, device);

    const refreshTokenEntity = new RefreshToken();
    refreshTokenEntity.token = refreshToken;
    refreshTokenEntity.device = device;
    refreshTokenEntity.user = user;
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken, device };
  }

  // Refresh refresh and access token
  async refreshToken(oldRefreshToken: string, device: string): Promise<Tokens> {
    if (!oldRefreshToken || !device) {
      throw new CustomError(404, 'Refresh token is required');
    }

    try {
      const refreshTokenEntity = await this.refreshTokenRepository.findOne({
        where: { token: oldRefreshToken, device },
        relations: ['user'],
      });
      if (!refreshTokenEntity) {
        throw new CustomError(401, 'Invalid refresh token');
      }

      const user = refreshTokenEntity.user;
      const newAccessToken = generateAccessToken(user, device);
      const newRefreshToken = generateRefreshToken(user, device);

      refreshTokenEntity.token = newRefreshToken;
      await this.refreshTokenRepository.save(refreshTokenEntity);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        device,
      };
    } catch (error) {
      throw new CustomError(401, 'Invalid refresh token');
    }
  }

  // Logout and remove refresh token
  async logout(id: number, device: string) {
    await this.refreshTokenRepository.delete({
      user: { id },
      device,
    });
  }

  // Get user info
  async getUserInfo(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new CustomError(404, 'User not found');
    }
    return {
      ...user,
      id: user.identifier,
      identifier: undefined,
      password: undefined,
    };
  }
}
