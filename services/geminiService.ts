import { GoogleGenAI, Type } from "@google/genai";
import { InvestmentNews } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getInvestmentAdvice = async (): Promise<InvestmentNews> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = "Generate a short, fictional financial market news snippet for a game economy. Decide if the market goes UP, DOWN, or STABLE, and a percentage change (0-20%). Return JSON.";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trend: { type: Type.STRING, enum: ["UP", "DOWN", "STABLE"] },
            percentage: { type: Type.NUMBER },
            message: { type: Type.STRING }
          },
          required: ["trend", "percentage", "message"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as InvestmentNews;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      trend: "STABLE",
      percentage: 0.5,
      message: "Market pasar sedang tenang. Analis memprediksi kestabilan."
    };
  }
};