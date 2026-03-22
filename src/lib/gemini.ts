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
    const model = "gemini-3-flash-preview"; 
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
        const model = "gemini-2.5-flash";
        
        // Detect URLs in prompt or parts to enable urlContext
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urlsInPrompt = prompt.match(urlRegex) || [];
        const hasUrls = urlsInPrompt.length > 0;

        const contents = [
          {
            parts: [
              { text: prompt },
              ...(parts || [])
            ]
          }
        ];
  
        const config: any = {
          systemInstruction: systemInstruction || "Você é um assistente especializado em marketing imobiliário. Responda sempre em Português do Brasil. Se um link for fornecido, analise o conteúdo da página para extrair informações reais sobre o imóvel.",
          maxOutputTokens: 8192,
          temperature: 0.7,
        };

        if (hasUrls) {
          config.tools = [{ urlContext: {} }];
          // When using tools, responseMimeType 'application/json' is unsupported.
          // So we instruct the model to return JSON matching the schema.
          contents[0].parts.push({
            text: `\n\nCRITICAL INSTRUCTION: You MUST return ONLY a valid JSON object. Do not include any markdown formatting, explanations, or other text. The JSON object MUST strictly follow this schema:\n${JSON.stringify(schema, null, 2)}`
          });
        } else {
          config.responseMimeType = "application/json";
          config.responseSchema = schema;
        }

        const response = await client.models.generateContent({
          model,
          contents,
          config
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
        
        // Se for erro de cota (429), não tentar novamente e lançar erro amigável
        if (error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("429")) {
          throw new Error("O limite de uso da inteligência artificial foi atingido (Cota Excedida). Por favor, tente novamente mais tarde.");
        }
        
        // If it's an API key error, don't retry
        if (error.message?.includes("API Key")) throw error;
        
        // Wait a bit before retrying
        if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`Falha após ${maxRetries} tentativas: ${lastError?.message || "Erro desconhecido"}`);
  };
