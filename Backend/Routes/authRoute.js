import express from "express";
const router = express.Router();
import { loginuser, registeruser, updatePreferences } from "../Controllers/auth.js";
import { protect } from "../Middleware/AuthMiddleware.js";

router.post("/register", registeruser);

router.post("/login",(req,res,next)=>{
    console.log(req.body);
    next();
}, loginuser);

router.put("/preferences", protect, updatePreferences);

router.get("/info", protect, async (req, res) => {
  res.json(req.user);
});

export default router;
