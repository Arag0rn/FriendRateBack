import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const socketServer = http.createServer();
const io = new Server(socketServer);

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST']
};

io.use(cors(corsOptions));

io.on('connection', (socket) => {
  console.log('a User connected');
});

export { io, socketServer };