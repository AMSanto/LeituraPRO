import { GoogleGenAI, Type } from "@google/genai";
import { Assessment, Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

export const generateStudentAnalysis = async (student: Student & { grade?: string }, assessments: Assessment[]): Promise<string> => {
  if (assessments.length === 0) return "Sem avaliaÃ§Ãµes para analisar.";

  const prompt = `Analise o progresso de leitura de ${student.name} (${student.readingLevel}). HistÃ³rico: ${JSON.stringify(assessments)}. Gere um feedback pedagÃ³gico curto.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text || "NÃ£o foi possÃ­vel gerar a anÃ¡lise.";
  } catch (error) {
    return "Erro ao acessar a IA.";
  }
};

export const generateReadingMaterial = async (level: string, topic: string): Promise<{ title: string; content: string; questions: string[] }> => {
  const prompt = `Gere um texto para nÃ­vel ${level} sobre ${topic}. Retorne JSON com title, content e questions (array).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    throw new Error("Erro na geraÃ§Ã£o de material.");
  }
};