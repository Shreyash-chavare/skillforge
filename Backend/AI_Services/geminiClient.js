import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.MY_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY (or MY_KEY) is not set — AI features will fail.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

/**
 * OpenAI-compatible chat completion wrapper for Google Gemini.
 * @param {Object} opts
 * @param {string} [opts.model]
 * @param {Array<{role: string, content: string}>} opts.messages
 * @param {{ type: "json_object" }} [opts.response_format]
 */
export async function chatCompletion({
  model = DEFAULT_MODEL,
  messages,
  response_format,
}) {
  const jsonMode = response_format?.type === "json_object";

  let systemInstruction;
  const contents = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = systemInstruction
        ? `${systemInstruction}\n\n${msg.content}`
        : msg.content;
      continue;
    }
    const role = msg.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: msg.content }] });
  }

  const generativeModel = genAI.getGenerativeModel({
    model,
    ...(systemInstruction && { systemInstruction }),
    ...(jsonMode && {
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  const result = await generativeModel.generateContent({ contents });
  const text = result.response.text();

  return {
    choices: [{ message: { content: text } }],
  };
}
