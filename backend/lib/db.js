import mongoose from "mongoose";
import dotenv from 'dotenv';


dotenv.config()



const connectDb = async() =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDb connected on", conn.connection.host);
    } catch (error) {
        console.log("Error while Connecting MONGO_DB",error.message);
        process.exit(1)
    }
}


export default connectDb;