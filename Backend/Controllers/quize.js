// import express from 'express';
// const router = express.Router();

import {getOrFindQuiz, getRecQuiz } from '../services/QuizeService.js';
import Topic from '../Models/UserTopic.js'
import UserProgress from "../Models/Userprogress.js"
import { updateDailyProgress } from './progress.js';
import { generateRec } from '../AI_Services/RecommendAI.js';
import { chatCompletion } from '../AI_Services/geminiClient.js';


export const quizeController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { topic, order,suborder } = req.body;
    let quize ;
    if(!suborder) quize = await getOrFindQuiz(userId, topic, order);
    else quize=await getRecQuiz(userId,topic,order,suborder);
    return res.json({ success: true, quize });
  } catch (error) {
    console.error("Quiz error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


; // if you're still using it

export const quizesubmit = async (req, res) => {
    try {
      const { topicName, order, answers,timespent } = req.body;
      const userId = req.user._id;
  
      // 1️⃣ Find topic by user + topicName
      const topicDoc = await Topic.findOne({ userId, name: topicName });
      if (!topicDoc) {
        return res.status(404).json({ success: false, message: "Topic not found" });
      }
  
      // 2️⃣ Get lesson by order
      const lesson = topicDoc.titles.find(t => t.order === Number(order));
      if (!lesson) {
        return res.status(404).json({ success: false, message: "Lesson not found" });
      }
  
      if (!lesson.quiz || !lesson.quiz.questions?.length) {
        return res.status(400).json({ success: false, message: "Quiz not available" });
      }
  
      console.log("Received answers:", answers);
      console.log("Quiz questions:", lesson.quiz.questions);
  
      // 3️⃣ Evaluate quiz
      let correct = 0;
      const results = lesson.quiz.questions.map((q, idx) => {
        const ansIdx = answers[idx];
        if (ansIdx === undefined || ansIdx === null) {
          return { ...q.toObject?.() ?? q, userAnswerIndex: null, isCorrect: false };
        }

        const userAnswer = q.options[ansIdx];
        // Prefer comparing indices if we stored them; otherwise fallback to text compare
        const isCorrect = (typeof q.answerIndex === 'number')
          ? ansIdx === q.answerIndex
          : userAnswer === q.answer;

        if (isCorrect) correct++;
        return { ...q.toObject?.() ?? q, userAnswerIndex: ansIdx, isCorrect };
      });
  
      const score = Math.round((correct / lesson.quiz.questions.length) * 100);
      console.log(`Final score: ${correct}/${lesson.quiz.questions.length} = ${score}%`);
  
      // 4️⃣ Update lesson status inside Topic
      const justCompleted = score >= 80 && !lesson.completed;
      lesson.completed = score >= 80;
      await topicDoc.save();
  
      // 5️⃣ Track progress in UserProgress collection
      const upsertedProgress = await UserProgress.findOneAndUpdate(
        { userId, topic: topicDoc._id, lessonId: lesson._id }, // unique identifier
        { score, completed: lesson.completed, order: lesson.order,timespent,
          answers:results.map((r,idx)=>({
            questionId:lesson.quiz.questions[idx]._id,
            isCorrect:r.isCorrect
          }))
         
        },
        { upsert: true, new: true }
      );

      // 6️⃣ Record Daily Progress if this submission newly completed the lesson
      // Record daily progress whenever user scores >=80 to reflect activity today
      if (score >= 80) {
        await updateDailyProgress(userId, lesson._id);
      }

      if(score<80){
        const wronganswer=results.filter(r=>!r.isCorrect).map(r=>r.question);
        const prompt = `
The user struggled with the lesson: "${lesson.title}".
Lesson content: ${lesson.content}
Wrong questions: ${wronganswer.join(", ")}
Time spent: ${timespent} seconds.

Refer to Lesson content to analyze the user's performance using wrong questions and time spent.

Suggest 1-2 personalized subtopics (short titles, max 6 words each) 
to help the user improve this weak area. 
For each, also give a one-line reason.

Respond in JSON format with the exact key "subtopics":
{
  "subtopics": [
    { "title": "Recommended Subtopic", "reason": "Why recommended" }
  ]
}
Do NOT use any other key name other than "subtopics inside Respond".
`;

      const aiRes=await chatCompletion({
      messages: [{ role: "system", content: "You are a learning path recommender." },
               { role: "user", content: prompt }],
        response_format:{type:"json_object"}
      })
      // console.log(aiRes.choices[0].message.content);
      console.log("Full AI response:", JSON.stringify(aiRes, null, 2));
      

      // Gemini JSON response
// Step 1: get the raw content string
let contentStr = aiRes.choices[0].message.content;

// Step 2: parse it into a JS object
let contentObj;
try {
    contentObj = JSON.parse(contentStr);
} catch (err) {
    console.error("Failed to parse AI JSON content:", err, contentStr);
    contentObj = {};
}

// Step 3: extract recommendations safely
let recommendations = Array.isArray(contentObj.subtopics) ? contentObj.subtopics : [];


const RecommendedTitle = await generateRec(recommendations);

      console.log("AI raw response:", aiRes.choices[0].message.content);
      console.log("Extracted recommendations:", recommendations);
      

      const baseOrder=order||0;

      const formattedRecs = RecommendedTitle.map((r, idx) => ({
       ...r,
       order:baseOrder+(idx+0.1),
       generatedAt:new Date()
      }));

      await UserProgress.findOneAndUpdate(
        { userId, topic: topicDoc._id, lessonId: lesson._id },
        { $set: { recommendations: formattedRecs.slice(0, 2) } }, // overwrite
        { new: true }
      );

      };
      
  
      return res.json({ success: true, score, results });
    } catch (err) {
      console.error("Quiz submit error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  export const RecQuizSubmit = async (req, res) => {
    try {
      const userId = req.user._id;
      const { topicName, order, answers, suborder } = req.body;
  
      const topicDoc = await Topic.findOne({ userId, name: topicName });
      if (!topicDoc) {
        return res.status(404).json({ success: false, message: "Topic not found" });
      }
  
      const progress = await UserProgress.findOne({
        userId,
        topic: topicDoc._id,
        order: Number(order),
      });
      if (!progress) {
        return res.status(404).json({ success: false, message: "Progress not found" });
      }
  
      const recIndex = progress.recommendations.findIndex(
        (rec) => rec.order === Number(suborder)
      );
      if (recIndex === -1) {
        return res.status(404).json({ success: false, message: "Recommendation not found" });
      }
  
      const rec = progress.recommendations[recIndex];
      const quiz = rec.quiz;
  
      if (!quiz || quiz.length === 0) {
        return res.status(400).json({ success: false, message: "Quiz not available" });
      }
  
      // ✅ evaluate exactly like your original quiz
      let correct = 0;
      const results = quiz.map((q, idx) => {
        const ansIdx = answers[idx];
  
        if (ansIdx === undefined || ansIdx === null) {
          return { 
            ...q.toObject?.() ?? q, 
            userAnswerIndex: null, 
            isCorrect: false 
          };
        }
  
        const isCorrect = (typeof q.answerIndex === "number")
          ? ansIdx === q.answerIndex
          : q.options[ansIdx] === q.answer;
  
        if (isCorrect) correct++;
  
        return { 
          ...q.toObject?.() ?? q, 
          userAnswerIndex: ansIdx, 
          isCorrect 
        };
      });
  
      const score = Math.round((correct / quiz.length) * 100);
  
      // Save score back to progress
      progress.recommendations[recIndex].score = score;
      if (score >= 80) progress.recommendations[recIndex].pass = true;
      // Safely increment tried even if it was undefined/null
      const prevTried = typeof progress.recommendations[recIndex].tried === "number"
        ? progress.recommendations[recIndex].tried
        : 0;
      progress.recommendations[recIndex].tried = prevTried + 1;

      await progress.save();
  
      return res.json({ success: true, score, results });
  
    } catch (error) {
      console.error("Error in RecQuizSubmit:", error.message);
      res.status(500).json({ success: false, message: "Failed to submit recommendation quiz" });
    }
  };
  