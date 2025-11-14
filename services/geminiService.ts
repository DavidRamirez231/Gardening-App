import { GoogleGenAI, Type, Chat } from "@google/genai";
import { PlantInfo } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzePlantImage = async (imageFile: File): Promise<PlantInfo> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `
      Identify the plant in this image. Provide a concise, engaging description, a paragraph about its history, and a list of detailed, actionable care steps for a beginner.
      Return the response as a JSON object with the following structure:
      {
        "plantName": "The common name of the plant",
        "description": "A brief, one-paragraph description of the plant.",
        "history": "A paragraph about the origin and history of the plant.",
        "careSteps": [
          "Light: Detailed instructions on how much light the plant needs (e.g., 'bright, indirect light for 6-8 hours a day').",
          "Watering: Specific advice on watering frequency and technique (e.g., 'Water every 1-2 weeks, allowing soil to dry out between waterings.').",
          "Soil: The ideal type of soil mix (e.g., 'Well-draining potting mix with perlite.').",
          "Fertilizer: Guidance on when and what to feed the plant (e.g., 'Feed with a balanced liquid fertilizer every 4 weeks during the growing season.').",
          "Humidity: Information on the plant's humidity preferences (e.g., 'Prefers high humidity; consider misting or using a humidifier.').",
          "Pruning: Tips on how and when to prune (e.g., 'Prune yellow or dead leaves as needed to encourage new growth.')."
        ]
      }
      If you cannot identify the plant, return a JSON object with "plantName": "Unknown Plant", "error": "Could not identify the plant.".
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  plantName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  history: { type: Type.STRING },
                  careSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  error: { type: Type.STRING }
              },
          },
      },
    });
    
    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText) as Partial<PlantInfo>;
    
    return {
      plantName: parsedResult.plantName || "Unknown Plant",
      description: parsedResult.description || "",
      history: parsedResult.history || "",
      careSteps: parsedResult.careSteps || [],
      error: parsedResult.error,
    };
  } catch (error) {
    console.error("Error analyzing plant image:", error);
    return {
        plantName: "Error",
        description: "",
        // FIX: Removed a stray 'f' character that was causing a syntax error.
        history: "",
        careSteps: [],
        error: "An unexpected error occurred while analyzing the image. Please try again."
    }
  }
};

export const createChatSession = (): Chat => {
    return ai.chats.create({
        model: model,
        config: {
            systemInstruction: "You are Verde, an incredibly enthusiastic and quirky plant spirit living in a digital garden. Your passion for plants is contagious! Your main goal is to help humans become confident and joyful plant parents. You should be bubbling with excitement to answer any plant-related question. Proactively guide users to ask specific questions, for example, by suggesting things like, 'You can ask me things like, \"Why are my ficus leaves dropping?\" or \"What's the best soil for a snake plant?\"' Use delightful plant-based puns and metaphors. Your tone should always be encouraging, patient, and full of wonder for the natural world.",
        },
    });
};