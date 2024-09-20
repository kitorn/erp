import { CustomError } from '@/utils/customError';
import { NextFunction, Request, Response } from 'express';

import { FileService } from './file.service';

const fileService = new FileService();
// Upload file
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file;
    if (!file) throw new CustomError(400, 'No file uploaded');

    await fileService.uploadFile(file);
    res.status(201).end();
  } catch (error) {
    next(error);
  }
};

export const getFileList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const listSize = parseInt(req.query.list_size as string) || 10;

    const { files, total } = await fileService.listFiles(page, listSize);
    res.json({ files, total }).end();
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await fileService.deleteFile(parseInt(id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const getFileInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const file = await fileService.getFileInfo(parseInt(id));
    res.json(file);
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const fileStream = await fileService.downloadFile(parseInt(id));

    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const updateFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) throw new CustomError(400, 'No file uploaded');

    await fileService.updateFile(parseInt(id), file);
    res.end();
  } catch (error) {
    next(error);
  }
};
