
import { GoogleGenAI, Type } from "@google/genai";
import type { ItineraryItem } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getItinerarySuggestions = async (destination: string, interests: string): Promise<ItineraryItem[]> => {
    if (!process.env.API_KEY) return [];

    try {
        const prompt = `「${destination}」への旅行で、「${interests}」に興味がある旅行者向けの旅行プランを5つ提案してください。各提案について、適切な時間（例：「09:00」、「13:30」）、簡潔なタイトル、そして魅力的で短い説明を付けてください。`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            description: "A list of itinerary suggestions.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING, description: "Suggested time in HH:MM format." },
                                    title: { type: Type.STRING, description: "The title of the activity or place." },
                                    description: { type: Type.STRING, description: "A short description of the suggestion." },
                                },
                                required: ["time", "title", "description"]
                            }
                        }
                    },
                    required: ["suggestions"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result.suggestions && Array.isArray(result.suggestions)) {
            return result.suggestions.map((item: any) => ({
                id: `ai-${Date.now()}-${Math.random()}`,
                ...item,
            }));
        }
        return [];
    } catch (error) {
        console.error("Error getting itinerary suggestions:", error);
        return [];
    }
};
