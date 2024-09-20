import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';
import { fileRouter } from '@/components/file/file.router';
import { userRouter } from '@/components/user/user.router';
import { notFound } from '@/middlewares/notFound';

export const router = Router();

router.use('/', userRouter);
router.use('/file', authMiddleware, fileRouter);
router.use(notFound);
