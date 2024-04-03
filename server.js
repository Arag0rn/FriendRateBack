import mongoose from 'mongoose';
import dotenv from "dotenv";
import app from './app.js';
import { Server } from 'socket.io';
import http from 'http';
import connectMongoDB from './utils/db.js';
import express from 'express';

dotenv.config();

const {DB_HOST, PORT} = process.env;

app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server);


app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('user_verified', data => {
    console.log('A user verified');
  });
});



server.listen(PORT, () => {
  connectMongoDB();
  console.log(`Server started on port ${PORT}`)
  })


  export {io };