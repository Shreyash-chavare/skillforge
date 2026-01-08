import express from 'express'
const router=express.Router();
import { protect } from '../Middleware/AuthMiddleware.js';
import { getOrGenerateTitles, getOrGenerateTitleContent, getUserTopics, updateTopicDifficulty } from '../Controllers/Topic.js';


router.get('/user-topics',protect,getUserTopics);
router.get('/:topic/generate',protect,getOrGenerateTitles);
router.get('/:topic/titles/:order',protect,getOrGenerateTitleContent);
router.put('/:topic/difficulty',protect,updateTopicDifficulty);


export default router;