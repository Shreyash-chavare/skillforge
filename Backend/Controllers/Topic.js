import Topic from "../Models/UserTopic.js";
import { generateContent, generateTitles } from "../AI_Services/LessonAI.js";
import UserProgress from "../Models/Userprogress.js";

export const getOrGenerateTitles = async (req, res) => {
  try {
    const { topic } = req.params; 
    const userId = req.user._id;    
    const forceRegenerate = req.query.regenerate === 'true'; 

  
    let Topicdoc = await Topic.findOne({userId,name:topic });
    if (!Topicdoc) {
      return res.status(404).json({ message: "Topic not found" });
    }

    
    if (Topicdoc.generated && (!Array.isArray(Topicdoc.titles) || Topicdoc.titles.length === 0)) {
      Topicdoc.generated = false;
      await Topicdoc.save();
    }
    
    
    if (!forceRegenerate && Array.isArray(Topicdoc.titles) && Topicdoc.titles.length > 0) {
      return res.json({
        message: "Titles already exist",
        titles: Topicdoc.titles,
        nextTitle: Topicdoc.titles.find(t => !t.completed) || Topicdoc.titles[0]
      });
    }
    
    
    if (forceRegenerate && Array.isArray(Topicdoc.titles) && Topicdoc.titles.length > 0) {
      Topicdoc.titles = [];
      Topicdoc.generated = false;
      await Topicdoc.save();
    }

    
    const topicDifficulty = Topicdoc.difficulty || "beginner";
   
    const generatedTitles = await generateTitles(Topicdoc.name, topicDifficulty);
    
  
    const structuredTitles = generatedTitles.map((t, idx) => ({
      title: t.title,
      order: idx + 1,
      difficulty: t.difficulty, 
      completed: false,
      content: [],
      quiz: { questions: [] }
    }));

    
    Topicdoc.titles = structuredTitles;
    Topicdoc.generated = structuredTitles.length > 0;
    await Topicdoc.save();
  
  
    return res.json({
      message: "Titles generated successfully",
      titles: Topicdoc.titles,
      nextTitle: Topicdoc.titles[0]
    });

  } catch (error) {
   // console.error("Error in getOrGenerateTitles:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getOrGenerateTitleContent = async (req, res) => {
  try {
    const { topic, order } = req.params;
    const userId = req.user._id;

    const topicDoc = await Topic.findOne({ userId, name: topic });
    if (!topicDoc) return res.status(404).json({ message: "Topic not found" });

    let title = topicDoc.titles.find(t => t.order === Number(order));
    if (!title) return res.status(404).json({ message: "Title not found" });

    
    if (!Array.isArray(title.content) || title.content.length === 0) {
      
      const topicDifficulty = topicDoc.difficulty || "beginner";
      const paragraph = await generateContent(topicDoc.name,title.title,topicDifficulty);
      title.content = [ { type: 'text', value: paragraph || `Overview of ${topicDoc.name}: ${title.title}` } ];
      await topicDoc.save();
    }

    return res.json({ title,userId});
  } catch (error) {
   // console.error('Error in getOrGenerateTitleContent:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

export const getUserTopics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    
    const topics = await Topic.find({ userId }).select('name titles generated createdAt difficulty');
    
    return res.json({
      message: "User topics fetched successfully",
      topics: topics
    });
  } catch (error) {
   // console.error('Error in getUserTopics:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}


export const updateTopicDifficulty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { topic } = req.params; 
    const { difficulty } = req.body;

    if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty.toLowerCase())) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid difficulty. Must be: beginner, intermediate, or advanced" 
      });
    }

    const topicDoc = await Topic.findOne({ userId, name: topic });
    if (!topicDoc) {
      return res.status(404).json({ 
        success: false,
        message: "Topic not found" 
      });
    }

  
    const oldDifficulty = topicDoc.difficulty;
    const newDifficulty = difficulty.toLowerCase();
    
    if (oldDifficulty === newDifficulty) {
      return res.json({
        success: true,
        message: "Difficulty unchanged",
        topic: {
          name: topicDoc.name,
          difficulty: topicDoc.difficulty
        }
      });
    }

    
    topicDoc.difficulty = newDifficulty;  
    topicDoc.titles = [];
    topicDoc.generated = false;
    
    await topicDoc.save();
    await UserProgress.deleteMany({ userId, topic: topicDoc._id });

    res.json({
      success: true,
      message: "Topic difficulty updated. Content will be regenerated with new difficulty.",
      topic: {
        name: topicDoc.name,
        difficulty: topicDoc.difficulty,
        regenerated: true
      }
    });
  } catch (error) {
   // console.error('Error updating topic difficulty:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
}