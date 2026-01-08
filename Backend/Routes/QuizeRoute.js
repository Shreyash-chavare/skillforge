import express from 'express'
const router=express.Router();

import { protect } from '../Middleware/AuthMiddleware.js';
import {RecQuizSubmit, quizeController,quizesubmit} from '../Controllers/quize.js'

router.post('/generate',protect,quizeController)
 router.post('/submit',protect,quizesubmit)
 router.post('/Recsubmit',protect,RecQuizSubmit)


 export default router;