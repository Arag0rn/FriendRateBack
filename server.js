import dotenv from "dotenv";
import app from './app.js';
import { Server } from 'socket.io';
import http from 'http';
import connectMongoDB from './utils/db.js';
import express from 'express';
import { roomHandler } from "./helpers/roomHandler.js";



dotenv.config();

const { PORT} = process.env;

app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin:"*",
    methods: ["GET", "POST"],
  }
});


app.set('io', io);

io.on('connection', (socket) => {
  roomHandler(socket);

  socket.on("disconnect", ()=>{
    console.log('User disconnected')});
  socket.on('user_verified', data => {
    console.log('A user verified');
  });
});

connectMongoDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
  
  export {io };