import dotenv from "dotenv";
import OpenAI from "openai";
import Topic from "../Models/UserTopic.js";
import Userprogress from "../Models/Userprogress.js";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.mykey });

export const getOrFindQuiz = async (userId,topic,order) => {
  try {
   
    const topicDoc = await Topic.findOne({ userId, name: topic });
    if (!topicDoc) {
      throw new Error("Topic not found");
    }

 
    const lesson = topicDoc.titles.find(t => t.order === Number(order));
    if (!lesson) {
      throw new Error("Lesson not found");
    }

  
    if (lesson.quiz?.questions?.length > 0) {
      return lesson.quiz.questions;
    }

    
    const prompt = `
    You are an expert assessment designer specializing in creating high-quality, pedagogically sound quizzes that accurately measure learning outcomes.
    
    **Context**:
    Topic: ${topicDoc.name}
    Lesson Title: ${lesson.title}
    Difficulty Level: ${lesson.difficulty}
    Lesson Content: "${lesson.content?.[0]?.value || ""}"
    
    **Task**: Generate a comprehensive quiz with exactly 10 questions that thoroughly assess understanding of the lesson content.
    
    **Question Distribution**:
    1. **5 Knowledge & Comprehension Questions** (type: "standard")
       - Test core concepts, definitions, and basic understanding
       - Focus on "what" and "why" aspects
       - Should be directly answerable from the lesson content
       - Mix of recall and conceptual understanding
    
    2. **3 Application & Analysis Questions** (type: "case-study")
       - Present realistic scenarios requiring application of learned concepts
       - Test ability to analyze situations and make informed decisions
       - Should require synthesis of multiple concepts from the lesson
       - Mimic real-world problem-solving situations
    
    3. **2 Advanced Critical Thinking Questions** (type: "case-study")
       - Challenge deeper understanding and evaluation skills
       - Include "what would happen if..." or "best practice" scenarios
       - Test edge cases, limitations, or trade-offs
       - May include code debugging, architecture decisions, or optimization choices
    
    **Quality Requirements for ALL Questions**:
    
    1. **Relevance**: Every question MUST be directly related to the provided lesson content
    2. **Clarity**: Questions should be unambiguous and professionally written
    3. **Difficulty Alignment**:
       - Beginner: Focus on fundamentals, straightforward scenarios, clear right/wrong answers
       - Intermediate: Include nuanced situations, multiple valid approaches, real-world context
       - Advanced: Complex scenarios, optimization considerations, architectural decisions
    
    4. **Options Design**:
       - Provide exactly 4 options (A, B, C, D)
       - All options must be plausible and relevant
       - Avoid obvious wrong answers like "None of these" or joke options
       - Wrong options should represent common misconceptions or mistakes
       - Options should be similar in length and complexity
       - Only ONE option should be definitively correct
    
    5. **Case Study Requirements**:
       - Include 2-4 sentence scenario describing a realistic situation
       - Scenarios should be specific and detailed, not generic
       - Connect directly to practical applications mentioned in the lesson
       - Question should test decision-making or problem-solving ability
    
    **Difficulty-Specific Guidelines**:
    
    **For Beginner Level**:
    - Questions: Direct, clear, testing foundational understanding
    - Case studies: Simple, straightforward scenarios with obvious connections to theory
    - Example: "You need to store user data. Which database operation would you use?"
    
    **For Intermediate Level**:
    - Questions: Test understanding of patterns, best practices, and common workflows
    - Case studies: Realistic scenarios requiring choosing between valid alternatives
    - Example: "Your API is receiving 10,000 requests/minute. What optimization strategy would be most effective?"
    
    **For Advanced Level**:
    - Questions: Assume deep knowledge, test edge cases and advanced patterns
    - Case studies: Complex, multi-layered scenarios with trade-offs and constraints
    - Example: "In a distributed system with eventual consistency, how would you handle concurrent writes to prevent data loss?"
    
    **Output Format**:
    Return ONLY a valid JSON array with NO additional text, explanations, or markdown. Each question object must have:
    
    {
      "question": "Clear, specific question text",
      "type": "standard" | "case-study",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exact text of the correct option",
      "explanation": "1-2 sentences explaining why this answer is correct and why others are wrong",
      "scenario": "Only for case-study type: 2-4 sentence realistic scenario" // Optional, only for case-study
    }
    
    **Example Case Study Question**:
    {
      "question": "What is the most appropriate solution?",
      "type": "case-study",
      "scenario": "You're building an e-commerce platform expecting 50,000 concurrent users during Black Friday sales. Currently, your MongoDB database handles 100 queries per second, but load tests show this will create bottlenecks. The product catalog rarely changes, but user shopping carts update frequently.",
      "options": [
        "Implement Redis caching for product catalog with a 1-hour TTL and keep cart data in MongoDB",
        "Move everything to Redis for faster performance",
        "Upgrade to a more powerful MongoDB server instance",
        "Implement database sharding across multiple MongoDB instances"
      ],
      "answer": "Implement Redis caching for product catalog with a 1-hour TTL and keep cart data in MongoDB",
      "explanation": "This combines the benefits of Redis's speed for read-heavy product data while maintaining MongoDB's ACID properties for critical cart data. Options B and D are over-engineered, while C doesn't address the read bottleneck."
    }
    
    **Critical**: 
    - Base ALL questions on the actual lesson content provided
    - Do NOT add questions about topics not covered in the lesson
    - Ensure progressive difficulty within the quiz (easier questions first)
    - Test the most important concepts from the lesson, not trivial details
    
    Now generate the quiz.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    let quizData;
    try {
      let content = response.choices?.[0]?.message?.content ?? "";
      
      if (typeof content === 'string') {
        content = content.trim();
        if (content.startsWith("```")) {
          content = content.replace(/^```[a-zA-Z]*\n/, '').replace(/```\s*$/, '');
        }
      }
      const parsed = JSON.parse(content);
      let arr = null;
      if (Array.isArray(parsed)) {
        arr = parsed;
      } else if (parsed && Array.isArray(parsed.questions)) {
        arr = parsed.questions;
      } else if (parsed && Array.isArray(parsed.quiz)) {
        arr = parsed.quiz;
      }
      if (!arr || !Array.isArray(arr)) throw new Error("Not an array");

      quizData = arr.map(q => {
        const options = q.options || [];
        const answerText = q.answer;
        const answerIndex = options.findIndex(o => o === answerText);
        return {
          question: q.question,
          options,
          answer: answerText,
          answerIndex: answerIndex >= 0 ? answerIndex : undefined,
          type: q.type || "standard",
        };
      });
    } catch (err) {
     // console.error("AI bad response:", response.choices?.[0]?.message?.content);
      throw new Error("AI returned invalid format");
    }

    
    await Topic.updateOne(
      { _id: topicDoc._id, 'titles.order': lesson.order },
      { $set: { 'titles.$.quiz.questions': quizData } }
    );

    return quizData;
  } catch (err) {
   // console.error("Error in getOrFindQuiz:", err);
    throw err;
  }
};

export const getRecQuiz=async(userId,topic,order,suborder)=>{
     try {
      const topicDoc = await Topic.findOne({ userId, name: topic });
    if (!topicDoc) {
      throw new Error("Topic not found");
    }
    const progress = await Userprogress.findOne({
      userId,
      topic: topicDoc._id,
      order: Number(order),
    });

    if (!progress) {
      return res.status(404).json({ message: "No progress found" });
    }
    let titleobj;
    for(let idx=0;idx<progress.recommendations.length;idx++){
        const currobj=progress.recommendations[idx];
        if(currobj.order==suborder)  titleobj=currobj
    }
    return titleobj.quiz; 
     } catch (error) {
     // console.error("Error in getRecQuiz:", err);
      throw err;
     }
}