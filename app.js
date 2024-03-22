import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import dotenv from "dotenv";

import authRouter from './routes/api/auth-router.js';
import swaggerRouter from './swager/swager.js';

dotenv.config();

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use('/api/user', authRouter);
app.use("/swager", swaggerRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;