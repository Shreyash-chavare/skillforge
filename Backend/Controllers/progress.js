import UserProgress from '../Models/Userprogress.js';
import Topic from '../Models/UserTopic.js';
import DailyProgress from "../Models/ProgressHistory.js";


export const getProgress = async (req, res) => {
  const { topicName, order } = req.params;
  const userId = req.user._id;

  try {
   
    const topicDoc = await Topic.findOne({ userId, name: topicName });
    if (!topicDoc) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const progress = await UserProgress.findOne({
      userId,
      topic: topicDoc._id,
      order: Number(order),
    });

    if (!progress) {
      return res.status(404).json({ message: "No progress found" });
    }

    
    res.json({ score:progress.score, recommendations: progress.recommendations || [] });
  } catch (error) {
    //console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTopic = async (req, res) => {
  const userId = req.user._id;
  const { topic, order } = req.body;

  try {
    const updatedTopic = await Topic.findOneAndUpdate(
      { userId, name: topic, 'titles.order': order },
      { $set: { 'titles.$.completed': true } }, 
      { new: true } 
    ).lean(); 

    if (!updatedTopic) {
      return res.status(404).json({ message: 'Topic or title not found' });
    }
    
    const completedTitle = (updatedTopic.titles || []).find((t) => t.order === order);
    const completedLessonId = completedTitle ? completedTitle._id : null;

    if (completedLessonId) {
      await updateDailyProgress(req.user._id, completedLessonId);
    }
    res.status(200).json({
      message: 'Title marked completed',
      topic: updatedTopic
    });
  } catch (error) {
   // console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const userProgress=async(req,res)=>{
      const userId=req.user._id;
      try {
        const progress=await UserProgress.find({userId});
       // console.log(progress)
        res.json({userprogress:progress});

      } catch (error) {
        //console.error("Error in fetching user progress",error);
       res.status(500).json({ message: 'Server error' });
      }
}



export const updateDailyProgress = async (userId, completedLessonId) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    let dailyDoc = await DailyProgress.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!dailyDoc) {
      const calculatedStreak = await calculateStreakDays(userId);
      dailyDoc = new DailyProgress({
        userId,
        date: new Date(),
        completedTitles: [],
        titlesCompletedToday: 0,
        streakDays: calculatedStreak > 0 ? calculatedStreak : 1, 
      });
    }

    if (dailyDoc.streakDays === undefined) {
      dailyDoc.streakDays = await calculateStreakDays(userId);
    }

    
    const hasAlready = dailyDoc.completedTitles.some((id) => id.toString() === completedLessonId.toString());
    if (!hasAlready) {
      dailyDoc.completedTitles.push(completedLessonId);
      dailyDoc.titlesCompletedToday += 1;
      
   
      if (dailyDoc.titlesCompletedToday === 1) {
       
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStart = new Date(yesterday);
        yStart.setHours(0, 0, 0, 0);
        const yEnd = new Date(yesterday);
        yEnd.setHours(23, 59, 59, 999);

        const yesterdayDoc = await DailyProgress.findOne({
          userId,
          date: { $gte: yStart, $lte: yEnd },
          titlesCompletedToday: { $gt: 0 },
        });

        if (yesterdayDoc && typeof yesterdayDoc.streakDays === 'number') {
          dailyDoc.streakDays = yesterdayDoc.streakDays + 1;
        } else if (yesterdayDoc) {
          dailyDoc.streakDays = 1 + (await calculateStreakDays(userId) || 0);
        } else {
          dailyDoc.streakDays = 1;
        }
      }
    }

    // Safeguard: any day with activity must have at least 1 streak day
    if ((dailyDoc.titlesCompletedToday || 0) > 0 && (!dailyDoc.streakDays || dailyDoc.streakDays < 1)) {
      dailyDoc.streakDays = 1;
    }

    await dailyDoc.save();
    console.log(`Daily Progress Updated - Completed Today: ${dailyDoc.titlesCompletedToday} titles, Streak: ${dailyDoc.streakDays} days`);
  } catch (err) {
   //// console.error("Error updating daily progress:", err);
  }
};


const calculateStreakDays = async (userId) => {
  try {
    const today = new Date();
    let streakDays = 0;
    let currentDate = new Date(today);
    
   // console.log(`Calculating streak for user ${userId} starting from ${today.toISOString()}`);
    
    
    while (true) {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);
      
     // console.log(`Checking date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
      
      const dayRecord = await DailyProgress.findOne({
        userId,
        date: { $gte: startOfDay, $lte: endOfDay },
        titlesCompletedToday: { $gt: 0 }
      });
      
     // console.log(`Day record found:`, dayRecord ? `${dayRecord.titlesCompletedToday} titles completed` : 'No activity');
      
      if (dayRecord) {
        streakDays++;
        console.log(`Streak continues: ${streakDays} days`);
        
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
   
        console.log(`Streak ends at ${streakDays} days`);
        break;
      }
      
  
      if (streakDays > 365) {
        //console.log("Streak calculation stopped at 365 days for safety");
        break;
      }
    }
    
    console.log(`Final streak calculation: ${streakDays} days`);
    return streakDays;
  } catch (err) {
   // console.error("Error calculating streak:", err);
    return 0;
  }
};


export const migrateStreakDays = async (req, res) => {
  try {
    const userId = req.user._id;
    
   
    const recordsToUpdate = await DailyProgress.find({
      userId,
      streakDays: { $exists: false }
    });
    
    //console.log(`Found ${recordsToUpdate.length} records to migrate for user ${userId}`);
    
    let updatedCount = 0;
    for (const record of recordsToUpdate) {
      const streakDays = await calculateStreakDays(userId);
      record.streakDays = streakDays > 0 ? streakDays : 1;
      await record.save();
      updatedCount++;
     // console.log(`Updated record ${record._id} with streak: ${record.streakDays}`);
    }
    
    res.json({
      success: true,
      message: `Migrated ${updatedCount} records`,
      updatedCount
    });
  } catch (err) {
    //console.error("Migration error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
