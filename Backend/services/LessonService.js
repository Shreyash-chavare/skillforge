
// import Lesson from '../Models/lesson.js'
// import dotenv from'dotenv'
// import OpenAi from 'openai'
// dotenv.config()

// const openai=new OpenAi({
//   apiKey:process.env.mykey
// })

// export const getOrFindLesson=async(topic,title,difficulty,user)=>{
//     let lesson=await Lesson.findOne({topic,title,difficulty});
    

//     if(lesson) return lesson;

//     const releventField=user.preferences.fields.filter(f=>f.toLowerCase().includes(topic.toLowerCase()));

//     const prompt = `
// Create a personalized ${difficulty} level lesson.

// Topic: ${topic}
// Title: ${title}

// User learning context:
// - Preferred field: ${releventField.length > 0 ? releventField.join(", ") : "General"}
// - Target difficulty: ${user.preferences.difficulty}

// Lesson Requirements:
// 1. Provide a **short explanation** of the concept (3–5 sentences).
// 2. Include **1–2 clear examples** directly related to ${title}.
// 3. Content must be strictly derived from "${topic}" → "${title}" only.
// 4. Include **exactly one case study** at the end:
//    - Difficulty level: ${difficulty}
//    - Format: 2–4 sentences describing a real-world/scenario problem, followed by 1 guiding question.
// 5. Output format must be a structured JSON object with these fields:
// {
//   "explanation": "string",
//   "examples": ["string", "string"],
//   "case_study": {
//     "scenario": "string",
//     "question": "string"
//   }
// }
// Do not add extra commentary or text outside this JSON.
// `;

//     const response=await openai.chat.completions.create(
//       {
//         model:"gpt-4o-mini",
//         messages:[{role:"user",content:prompt}]
//       }
//     );

//     const generatedcontent=response.choices[0].message.content;


//       lesson=new Lesson({
//         topic,
//         title,
//         difficulty,
//         content: [{type:'text',value:generatedcontent}]
       
//       })
//       await lesson.save();

//       return lesson;
// };