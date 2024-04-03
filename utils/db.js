import mongoose from 'mongoose';

const connectMongoDB = async () => {
    try {
      await mongoose.connect(process.env.DB_HOST);
      console.log('Data Base Connected...');

    } catch (error) {
        console.log("Error connection to MongoDB", error.message)
    }
}

export default connectMongoDB;
