const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetLessonPerWeek: { type: Number, default: 3 },
    streak: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now },   // to reset weekly
    lessonsCompletedThisWeek: { type: Number, default: 0 }, // counter
    createdAt: { type: Date, default: Date.now }
  });
  