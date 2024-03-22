import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { WS_PORT } = process.env;
const app = express();
const server = http.createServer(app);
const io = new Server(server);


io.on('connection', (socket) => {
  console.log('A user connected');
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(WS_PORT, () => {
  console.log(`Socket server is running on port ${WS_PORT}`);
});

export { io };