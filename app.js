import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import dotenv from "dotenv";
import http from 'http';

import contactsRouter from './routes/api/contacts.js';
import authRouter from './routes/api/auth-router.js';

import io from './configs/socketConfig.js';

dotenv.config();

const {WS_PORT} = process.env;

const app = express();
const server = http.createServer(app);

io.attach(server);
server.listen(WS_PORT, () => console.log("Socket server is running on port " + WS_PORT));

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use('/api/user', authRouter);
app.use('/api/contacts', contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;