import express from 'express';
import logger from 'morgan';
import dotenv from "dotenv";
import cors from 'cors';
import authRouter from './routes/api/auth-router.js';
import swaggerRouter from './swager/swager.js';

dotenv.config();

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(cors());

app.use(logger(formatsLogger));

app.use(express.json());

app.use('/api/user', authRouter);
app.use("/swager", swaggerRouter);

app.get('/', (req, res) => {
  res.send('Server active!');
});

app.get('/link', (req, res) => {
  // підключення лінка - видалити потім
  res.sendFile('link.html', { root: './public' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});



export default app;