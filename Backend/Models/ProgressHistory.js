// models/DailyProgress.js
import mongoose from "mongoose";

const dailyProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Date when progress was recorded (one document per day)
  date: { type: Date, required: true },

  // Number of titles completed today
  titlesCompletedToday: { type: Number, default: 0 },

  // Learning streak - consecutive days with activity
  streakDays: { type: Number, default: 0 },

  // Store which titles were completed today
  completedTitles: [{ type: mongoose.Schema.Types.ObjectId }],

  createdAt: { type: Date, default: Date.now },
});

dailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true }); // one entry per day per user

export default mongoose.model("DailyProgress", dailyProgressSchema);
