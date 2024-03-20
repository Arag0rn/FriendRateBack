import { Server } from 'socket.io';
import http from 'http';

const socketServer = http.createServer();
const io = new Server(socketServer);

io.on('connection', (socket) => {
  console.log('a User connected');
});

export { io, socketServer };