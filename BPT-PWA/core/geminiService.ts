import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getForensicInsight(module: string, dataSummary: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the Brahan Forensic Architect. Analyze ${module}: ${dataSummary}. Provide a short terminal log entry diagnosis.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    return "ANALYSIS ERROR: DATA ABYSS PENETRATION FAILED.";
  }
}