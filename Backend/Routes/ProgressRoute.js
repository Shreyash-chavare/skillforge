import express from 'express'
const router=express.Router();

import { protect } from '../Middleware/AuthMiddleware.js';
import { getProgress, updateTopic ,userProgress, migrateStreakDays} from '../Controllers/progress.js';
import { getDailyProgress } from '../Controllers/Dailyprogress.js';

router.get('/userprogress/:topicName/:order',protect,getProgress);
router.post('/mark',protect,updateTopic);
router.get('/userprogress',protect,userProgress);

// router.get('/daily',protect,getDailyProgress)
router.post('/migrate-streak',protect,migrateStreakDays)
// routes/dailyProgress.js (or add to existing routes)
router.get('/daily-progress', protect, getDailyProgress);

export default router;