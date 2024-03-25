import mongoose from 'mongoose';
import dotenv from "dotenv";
import app from './app.js';
import { io } from './configs/socketConfig.js';



dotenv.config();

const {DB_HOST, PORT} = process.env;

mongoose.connect(DB_HOST)
.then(() => {app.listen(PORT, () => {
  console.log("Database connection successful");
}) 
})
.catch(error => {
  console.log(error.message);
  process.exit(1);
  })

  io.on('connection', (socket) => {
    console.log('A user connected');
  });

