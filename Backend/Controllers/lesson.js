// import express from 'express'
// const router=express.Router();

// import {getOrFindLesson} from '../services/LessonService.js'
// export const lessonController=async(req,res)=>{
//     try {
//         const {topic,title,difficulty}=req.body;
//         const user=req.user;
//         const lesson=await getOrFindLesson(topic,title,difficulty,user);
        
//         return res.json({sucess:true,lesson})
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// }