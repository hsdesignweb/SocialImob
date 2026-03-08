import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client lazily
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (ai) return ai;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  ai = new GoogleGenAI({ apiKey });
  return ai;
};

export const generateContent = async (prompt: string, systemInstruction?: string) => {
  const client = getAI();
  if (!client) {
    throw new Error("Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file.");
  }

  try {
    const model = "gemini-2.0-flash"; 
    const response = await client.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};

export const generateJSON = async (prompt: string, schema?: any, systemInstruction?: string, parts?: any[]) => {
    const client = getAI();
    if (!client) {
      throw new Error("Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file.");
    }
  
    let lastError: any;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = "gemini-2.0-flash";
        
        const contents = [
          {
            parts: [
              { text: prompt },
              ...(parts || [])
            ]
          }
        ];
  
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
              responseMimeType: "application/json",
              responseSchema: schema,
              systemInstruction: systemInstruction,
              maxOutputTokens: 8192, // Ensure enough tokens for large JSONs
          }
        });
    
        if (!response.text) {
          throw new Error("A IA não retornou texto válido.");
        }
  
        // Clean up markdown code blocks if present
        let cleanText = response.text.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\n?/, "").replace(/\n?```$/, "");
        }
  
        try {
          return JSON.parse(cleanText);
        } catch (parseError) {
          // Fallback: try to extract JSON object if there's extra text
          const firstBrace = cleanText.indexOf('{');
          const lastBrace = cleanText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
             const jsonCandidate = cleanText.substring(firstBrace, lastBrace + 1);
             return JSON.parse(jsonCandidate);
          }
          throw parseError;
        }

      } catch (error: any) {
        console.warn(`Attempt ${attempt} failed:`, error);
        lastError = error;
        // If it's an API key error, don't retry
        if (error.message?.includes("API Key")) throw error;
        // Wait a bit before retrying
        if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Falha após ${maxRetries} tentativas: ${lastError?.message || "Erro desconhecido"}`);
  };
