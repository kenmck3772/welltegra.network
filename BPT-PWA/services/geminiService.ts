
import { GoogleGenAI } from "@google/genai";

// Always use the required initialization format for GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getForensicInsight(module: string, dataSummary: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the Brahan Forensic Architect, a veteran offshore data specialist. 
      Analyze this ${module} data snapshot: ${dataSummary}.
      Provide a concise, professional, cyber-forensic diagnosis. 
      Identify potential 'Data Ghosts' or 'Mechanical Trauma'. 
      Format as a short terminal log entry.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Correctly extracting the generated text output via property access
    return response.text;
  } catch (error) {
    console.error("Forensic analysis failed:", error);
    return "ANALYSIS ERROR: UNABLE TO PENETRATE DATA ABYSS.";
  }
}
