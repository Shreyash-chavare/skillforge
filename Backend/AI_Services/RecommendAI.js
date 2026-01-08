import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.mykey });

export const generateRec = async (recommendations) => {
  
  const promises = recommendations.map(async (rec) => {
    const expandPrompt = `
    Generate a short learning module for the subtopic: "${rec.title}".
    It should include:
    1. **Content**: 3-5 concise paragraphs (clear explanation).
    2. **Quiz**: 4-5 MCQs with 4 options each.
       Mark the correct option index.

    Respond in JSON format:
    {
      "content": "learning material...",
      "quiz": [
        { "question": "...", "options": ["opt1","opt2","opt3","opt4"], "answerIndex": 2 }
      ]
    }
    `;

    const expandRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: expandPrompt }],
      response_format: { type: "json_object" },
    });

    const expanded = JSON.parse(expandRes.choices[0].message.content);

    return {
      title: rec.title,
      reason: rec.reason,
      content: expanded.content,
      quiz: expanded.quiz,
      score: 0,
    };
  });

  
  return Promise.all(promises);
};
