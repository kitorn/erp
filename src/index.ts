import express from 'express';
import 'dotenv/config';
import 'module-alias/register';
import cookieParser from 'cookie-parser';
import { db } from '@/config/db';

import { router } from './router';
import { errorHandler } from '@/middlewares/error';

import cors from 'cors';

const { PORT = 3000 } = process.env;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);
app.use(errorHandler);

db.initialize()
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => console.log(error));

app.listen(PORT, async () => {
  console.log(`App listening on port ${PORT}`);
});
