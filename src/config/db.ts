import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '@/components/user/user.entity';
import { File } from '@/components/file/file.entity';
import { RefreshToken } from '@/components/user/refreshToken.entity';

export const db = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, File, RefreshToken],
  migrations: [],
  subscribers: [],
});
