import mongoose from 'mongoose';
import { DB_NAME} from '../constants.js';


const connectDB  = async  () => {
    try {
        console.log(process.env.MONGODB_URL);
        const connectionObj = await mongoose.connect(`${process.env.MONGODB_URL}`);
        // console.log(`\n db connected <> ${connectionObj.connection.host}\n ${process.env.MONGODB_URL}/${DB_NAME}`)
    } catch (error) {
        console.log("MongoDB connection error: " + error)
        process.exit(1)
    }
}

export default connectDB;

    
