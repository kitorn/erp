import { Router } from 'express';
import multer from 'multer';
import {
  uploadFile,
  getFileList,
  deleteFile,
  getFileInfo,
  downloadFile,
  updateFile,
} from './file.controller';

const router = Router();
const upload = multer();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/list', getFileList);
router.delete('/delete/:id', deleteFile);
router.get('/:id', getFileInfo);
router.get('/download/:id', downloadFile);
router.put('/update/:id', upload.single('file'), updateFile);

export { router as fileRouter };
