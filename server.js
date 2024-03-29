import mongoose from 'mongoose';
import dotenv from "dotenv";
import app from './app.js';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const {DB_HOST, PORT} = process.env;

const server = http.createServer(app);
const io = new Server(server);


app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected');
});
io.on('user_verified', (socket) => {
  console.log('A user connected');
});


mongoose.connect(DB_HOST)
.then(() => {server.listen(PORT, () => {
  console.log("Database connection successful");
}) 
})
.catch(error => {
  console.log(error.message);
  process.exit(1);
  })


  export {io };