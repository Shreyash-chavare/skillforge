import express from 'express'
const router=express.Router();

import { protect } from '../Middleware/AuthMiddleware.js';
import { getProgress, updateTopic ,userProgress, migrateStreakDays} from '../Controllers/progress.js';
import { getDailyProgress } from '../Controllers/Dailyprogress.js';

router.get('/userprogress/:topicName/:order',protect,getProgress);
router.post('/mark',protect,updateTopic);
router.get('/userprogress',protect,userProgress);


router.post('/migrate-streak',protect,migrateStreakDays)
router.get('/daily-progress', protect, getDailyProgress);

export default router;