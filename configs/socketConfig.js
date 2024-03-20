import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer();
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a User connected');
});

export default io;