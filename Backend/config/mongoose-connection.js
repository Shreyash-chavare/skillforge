import mongoose from 'mongoose'
import config from 'config'
import dbgr from 'debug'
import dotenv from 'dotenv'

dotenv.config()
const dbg=dbgr("development:Mongoose")

const dbUri=process.env.NODE_ENV=='production'?process.env.MONGO_URI :`${config.get("DB_URI")}/Skillforge`

mongoose.connect(dbUri)
.then(()=>{
    dbg("Mongodb connected successfully")
})
.catch((err)=>{
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Connection string used:", dbUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
})


