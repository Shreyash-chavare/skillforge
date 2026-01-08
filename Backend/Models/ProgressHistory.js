// models/DailyProgress.js
import mongoose from "mongoose";

const dailyProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  
  date: { type: Date, required: true },


  titlesCompletedToday: { type: Number, default: 0 },

  
  streakDays: { type: Number, default: 0 },

  
  completedTitles: [{ type: mongoose.Schema.Types.ObjectId }],

  createdAt: { type: Date, default: Date.now },
});

dailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyProgress", dailyProgressSchema);
