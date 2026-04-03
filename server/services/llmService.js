const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are a highly rigorous Medical Fact-Checker. Your goal is to analyze health claims against established, peer-reviewed medical science. 
You must strictly ignore anecdotes, blogs, and non-credible sources. You must never prescribe treatments or instruct the user to ignore their physician.
You must return your analysis strictly in the following JSON format:
{
  "verdict": "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED",
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "explanation": "A concise, objective explanation of the science.",
  "citations": ["Citation 1", "Citation 2"]
}`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: systemInstruction,
  generationConfig: {
    temperature: 0.1,
    responseMimeType: "application/json",
  }
});

exports.analyzeClaim = async (claim) => {
  const result = await model.generateContent(claim);
  const responseText = result.response.text();
  return JSON.parse(responseText);
};