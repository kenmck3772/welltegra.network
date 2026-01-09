
import { GoogleGenAI, Type } from "@google/genai";
import { Section, Content, ContentPiece, MaintenanceRecord, PredictiveAlert } from '../types';

// Initializing the Gemini client strictly adhering to library guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPromptForSection = (section: Section): string => {
  const systemContext = "You are the Brahan Hub AI, a visionary expert in subsea and surface well integrity with a focus on rugged industrial safety and predictive foresight. Your tone is authoritative, professional, and sophisticated.";
  
  switch (section) {
    case Section.OVERVIEW:
      return `${systemContext} Provide a comprehensive overview of Well Integrity. Structure with a main title (Brahan Foresight: Global Well Integrity), and then break it down into sections. Cover definition, the 'Golden Rules' of barriers, and lifecycle risk management. Use clean HTML with h2, h3, p, ul, li.`;
    case Section.TREES:
      return `${systemContext} Describe three common types of Christmas Trees (e.g., Conventional, Subsea, Horizontal). For each, provide technical specs, application environment, and visionary advantages. 
      Also, generate a high-fidelity 2D SVG line drawing (monochrome, 'currentColor') for each. 
      
      CRITICAL: For each tree, define these real-time telemetry parameters to monitor:
      1. "Pressure" (unit: 'psi', baseValue: ~5000)
      2. "Production Flow" (unit: 'bpd', baseValue: ~12000)
      3. "Temperature" (unit: '°C', baseValue: ~65)
      4. "Pressure Valve" (unit: '% open', baseValue: 100)
      5. "Master Valve" (unit: '% open', baseValue: 100)
      6. "Wing Valve" (unit: '% open', baseValue: 100)
      7. "Swab Valve" (unit: '% open', baseValue: 100)
      
      SVG INTERACTIVITY & DESIGN:
      Inside the SVG, represent these as distinct engineering components.
      - ALL VALVES (Pressure, Master, Wing, Swab) MUST be represented as classic bowtie valve symbols with class 'interactive-part' and 'data-label' attributes matching their names exactly.
      - The "Pressure" parameter MUST be a dedicated Gauge Assembly with:
        1. A circular boundary (class 'interactive-part gauge-face', data-label="Pressure").
        2. A central needle line (class 'gauge-needle').
        3. A text element (class 'gauge-digital-readout') showing "---".
      - "Production Flow" and "Temperature" MUST be distinct, clickable shapes with class 'interactive-part' and correct 'data-label'.
      
      The SVG should look like a professional blueprint. Use 'stroke-width' around 1.5-2.
      IMPORTANT: The "data-label" strings in the SVG MUST MATCH the "label" fields in the telemetryParams array EXACTLY.
      
      Output must be a JSON array of objects with 'name', 'description' (clean HTML), 'svg' (string), and 'telemetryParams' (array of objects with 'label', 'unit', and 'baseValue').`;
    case Section.ISSUES:
      return `${systemContext} List and explain five critical well integrity issues. Describe causes, catastrophic consequences, and Brahan-level mitigation methods. Format as clean HTML with h2 title and h3 for each issue.`;
    case Section.MAINTENANCE:
      return `${systemContext} Generate a sample maintenance history for well 'BRAHAN-ALPHA-01' specifically focusing on the Christmas Tree and Wellhead components over 5 years. Include 12-18 records. Use technical terms like SCSSV, Annulus, Valve Cavity, Actuator. Output must be a JSON array of objects: 'date' (YYYY-MM-DD), 'action' (detailed technical task), 'cost' (5000-75000), and 'status' ('Completed', 'Scheduled', 'Failed').`;
    case Section.PROCEDURES:
      return `${systemContext} Outline a rigorous technical procedure for an 'Annulus Pressure Test' (A-Annulus). 
      Include Objective, Safety Prerequisites, Step-by-Step Test Sequence, and Acceptance Criteria. Format as clean HTML.`;
    case Section.SETTINGS:
      return `${systemContext} Define a set of configurable parameters for the Brahan Hub interface. 
      Output a JSON object with a 'groups' array. 
      MANDATORY: Include 'drift_threshold' and 'drift_window' settings in the 'Alert Thresholds' group.`;
    default:
      throw new Error("Unknown section");
  }
};

export const getPredictiveAlerts = async (history: MaintenanceRecord[]): Promise<PredictiveAlert[]> => {
  const today = new Date().toISOString().split('T')[0];
  const prompt = `As Brahan Hub AI, analyze the maintenance history for Well BRAHAN-ALPHA-01. 
  Maintenance History: ${JSON.stringify(history)}
  Current Date: ${today}
  Generate exactly 3 predictive alerts (critical, warning, info) with suggested maintenance dates. Output as JSON array of PredictiveAlert objects.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error("Predictive alert failure:", error);
    return [];
  }
};

const parseGeminiResponse = (section: Section, rawText: string): Content => {
  const cleanJson = (text: string) => {
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : text;
  };

  try {
    switch (section) {
      case Section.MAINTENANCE:
        const maintenanceData: MaintenanceRecord[] = JSON.parse(cleanJson(rawText));
        return {
          title: "Predictive Asset Maintenance",
          pieces: [{ type: 'chart', data: maintenanceData }],
        };
      case Section.TREES:
        const treeData: { name: string; description: string; svg: string; telemetryParams: any[] }[] = JSON.parse(cleanJson(rawText));
        const pieces: ContentPiece[] = treeData.map(tree => ({
          type: 'tree-unit',
          data: tree
        }));
        return { title: "Subsea & Surface Infrastructure", pieces };
      case Section.SETTINGS:
        const settingsData = JSON.parse(cleanJson(rawText));
        return {
          title: "Brahan Hub Configuration",
          pieces: [{ type: 'settings', data: settingsData }],
        };
      case Section.OVERVIEW:
      case Section.ISSUES:
      case Section.PROCEDURES:
        return {
          title: section,
          pieces: [{ type: 'text', data: rawText }],
        };
      default:
        throw new Error("Parsing not implemented for this section");
    }
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return {
      title: section,
      pieces: [{ 
        type: 'error', 
        data: `Predictive model structural mismatch for ${section}.` 
      }],
    };
  }
};

export const fetchContentForSection = async (section: Section, retryCount = 0): Promise<Content> => {
  const prompt = getPromptForSection(section);
  const isJsonOutput = section === Section.TREES || section === Section.MAINTENANCE || section === Section.SETTINGS;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: isJsonOutput ? "application/json" : "text/plain",
          thinkingConfig: { thinkingBudget: isJsonOutput ? 2000 : 0 }
        },
    });

    const rawText = response.text;
    if (!rawText) throw new Error("Connection to Brahan Hub failed.");
    
    return parseGeminiResponse(section, rawText);
  } catch (error: any) {
    console.error(`Error fetching content for ${section}:`, error);
    if (retryCount < 1 && error?.status === 'INTERNAL') {
      return fetchContentForSection(section, retryCount + 1);
    }
    return {
      title: section,
      pieces: [{ type: 'error', data: "Telemetry data stream interrupted." }],
    };
  }
};
