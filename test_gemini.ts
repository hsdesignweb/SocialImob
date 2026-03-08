import { generateJSON } from './src/lib/gemini';
import { Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Mock the property data
const propertyData = {
  type: "Apartamento",
  location: "São Paulo",
  price: "500000",
  features: ["2 quartos", "1 suíte", "Varanda Gourmet"]
};
const buyerProfile = "Família com filhos";
const goal = "Vender rápido";

const strategyPrompt = `
  Atue como um estrategista de marketing imobiliário sênior.
  
  Dados do Imóvel:
  ${JSON.stringify(propertyData)}
  
  Perfil Comprador: ${buyerProfile}
  Objetivo: ${goal}
  
  Defina a estratégia de lançamento. Retorne JSON:
  - angle: Ângulo principal de venda (uma frase curta e impactante)
  - persona: Descrição detalhada da persona
  - approach: Tom de voz e abordagem (ex: Emocional, Técnico, Urgência)
  - narrative: Sugestão de narrativa (storytelling)
  - sequence: Lista de 5 tópicos para sequência de posts
`;

const strategySchema = {
  type: Type.OBJECT,
  properties: {
    angle: { type: Type.STRING },
    persona: { type: Type.STRING },
    approach: { type: Type.STRING },
    narrative: { type: Type.STRING },
    sequence: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

async function test() {
  console.log("Testing Gemini JSON generation...");
  try {
    const result = await generateJSON(strategyPrompt, strategySchema);
    console.log("Success!", result);
  } catch (error) {
    console.error("Failed:", error);
  }
}

test();
