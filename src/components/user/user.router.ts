import {
  login,
  refreshTokens,
  signup,
  logout,
  getUserProfile,
} from './user.controller';
import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth';

const router = Router();

router.post('/signin', login);
router.post('/signin/new_token', refreshTokens);
router.post('/signup', signup);
router.get('/logout', authMiddleware, logout);
router.get('/info', authMiddleware, getUserProfile);

export { router as userRouter };
