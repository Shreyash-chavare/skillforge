import DailyProgress from '../Models/ProgressHistory.js'
export const getDailyProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
   
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyProgress = await DailyProgress.find({
      userId: userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });
    
    res.json(dailyProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily progress', error });
  }
}
  