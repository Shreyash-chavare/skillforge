import express from 'express'
const router=express.Router();


import authroute from './authRoute.js'
import quizeroute from './QuizeRoute.js'
import TopicRoute from './TopicRoute.js'
import ProgressRoute from './ProgressRoute.js'

// router.use('/lesson',lessonroute);

router.use('/auth',authroute);
router.use('/topics',TopicRoute)

router.use('/quize',quizeroute)
router.use('/progress',ProgressRoute);

export default router;