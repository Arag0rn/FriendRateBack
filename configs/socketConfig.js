// import { Server } from 'socket.io';
// import { createServer } from 'http';
// import cors from 'cors';


// const { WS_PORT } = process.env;

// const server = createServer();
// const io = new Server(server, {
//   cors: {
//     origin: "*"
//   }
// });


// io.on('connection', (socket) => {
//   console.log('A user connected');
// });

// server.listen(WS_PORT, () => {
//   console.log(`Socket server is running on port ${WS_PORT}`);
// });

// export { io };