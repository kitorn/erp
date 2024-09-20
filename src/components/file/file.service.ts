import { db } from '@/config/db';
import { s3 } from '@/config/s3';
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from '@/utils/customError';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import { File } from './file.entity';

import { Readable } from 'stream';

export class FileService {
  private fileRepository = db.getRepository(File);

  // Upload file to S3
  async uploadFile(file: Express.Multer.File) {
    try {
      const s3Key = `${uuidv4()}-${file.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const fileEntity = this.fileRepository.create({
        name: file.originalname,
        extension: file.originalname.split('.').pop() || '',
        mimeType: file.mimetype,
        size: file.size,
        uploadDate: new Date(),
        s3Key,
      });

      await this.fileRepository.save(fileEntity);
      return fileEntity;
    } catch (error) {
      throw new CustomError(500, 'Failed to upload file');
    }
  }

  // Get list of files with pagination
  async listFiles(
    page: number,
    listSize: number,
  ): Promise<{ files: File[]; total: number }> {
    const [files, total] = await this.fileRepository.findAndCount({
      skip: (page - 1) * listSize,
      take: listSize,
    });
    return { files, total };
  }

  // Delete file from s3 and database
  async deleteFile(id: number): Promise<void> {
    const file = await this.fileRepository
      .createQueryBuilder('file')
      .addSelect('file.s3Key')
      .where('file.id = :id', { id })
      .getOne();
    if (!file) throw new CustomError(404, 'File not found');

    try {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: file.s3Key,
      };

      await s3.send(new DeleteObjectCommand(deleteParams));
      await this.fileRepository.remove(file);
    } catch (error) {
      throw new CustomError(500, 'Error deleting file');
    }
  }

  // Get file info
  async getFileInfo(id: number): Promise<File> {
    const file = await this.fileRepository.findOneBy({ id });
    if (!file) throw new CustomError(404, 'File not found');
    return file;
  }

  // Download file
  async downloadFile(id: number): Promise<Readable> {
    const file = await this.fileRepository
      .createQueryBuilder('file')
      .addSelect('file.s3Key')
      .where('file.id = :id', { id })
      .getOne();
    if (!file) throw new CustomError(404, 'File not found');

    try {
      const downloadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: file.s3Key,
      };

      const { Body } = await s3.send(new GetObjectCommand(downloadParams));
      return Body as Readable;
    } catch (error) {
      throw new CustomError(500, 'Error downloading file');
    }
  }

  // Update file
  async updateFile(id: number, newFile: Express.Multer.File) {
    const file = await this.fileRepository
      .createQueryBuilder('file')
      .addSelect('file.s3Key')
      .where('file.id = :id', { id })
      .getOne();
    if (!file) throw new CustomError(404, 'File not found');

    try {
      // Delete file from S3
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: file.s3Key,
      };
      await s3.send(new DeleteObjectCommand(deleteParams));

      // Upload new file to S3
      const s3Key = `${uuidv4()}-${newFile.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        Body: newFile.buffer,
        ContentType: newFile.mimetype,
        ContentLength: newFile.size,
      };
      await s3.send(new PutObjectCommand(uploadParams));
      file.name = newFile.originalname;
      file.extension = newFile.originalname.split('.').pop() || '';
      file.mimeType = newFile.mimetype;
      file.size = newFile.size;
      file.uploadDate = new Date();
      file.s3Key = s3Key;
      await this.fileRepository.save(file);
    } catch (error) {
      throw new CustomError(500, 'Error updating file');
    }
  }
}
