
import mongoose from "mongoose";
import { APP_NAME } from "../constent.js";


const db_connection = async () => {
  try {
    const connectionString = await mongoose.connect(
      `${process.env.MONGODB}/${APP_NAME}`
    );
    console.log(`connection String: ${connectionString.connection.host}`);
  } catch (error) {
    console.log(`Error while connection with mongodb ${error}`);
  }
};

export default db_connection;
