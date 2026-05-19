import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()


const dbUri=process.env.NODE_ENV=='production'?process.env.MONGO_URI :process.env.DB_URI/Skillforge

mongoose.connect(dbUri)
.then(()=>{
    console.log("Mongodb connected successfully")
})
.catch((err)=>{
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Connection string used:", dbUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
})


