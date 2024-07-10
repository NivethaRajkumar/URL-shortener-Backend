import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
const mongoDb_URL = process.env.MANGODB_URL;

//mongoose
const connectDB = async(req,res)=>{
   try {
    
    const connection = await mongoose.connect(mongoDb_URL);
    console.log("mongodb connected");
    return connection;
   } catch (error) {
    console.log(error);
    res.status(500).json({message:"MongoDB connection server error"});
   }

}

export default connectDB;