import mongoose from 'mongoose'
import 'dotenv/config'

const dbUri=process.env.MONGO_URI ;

mongoose.connect(dbUri)
.then(()=>{
    console.log("Mongodb connected successfully")
})
.catch((err)=>{
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Connection string used:", dbUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    process.exit(1);
})


