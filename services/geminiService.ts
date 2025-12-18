
import { GoogleGenAI, Type } from "@google/genai";
import { Assessment, Student } from "../types";

export const generateStudentAnalysis = async (student: Student & { grade?: string }, assessments: Assessment[]): Promise<string> => {
  if (assessments.length === 0) return "Sem avaliações para analisar.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analise o progresso de leitura de ${student.name} (${student.readingLevel}). Histórico: ${JSON.stringify(assessments)}. Gere um feedback pedagógico curto e direto focado em fluência e compreensão.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro na análise Gemini:", error);
    return "Erro ao processar análise com IA. Verifique sua conexão ou tente novamente mais tarde.";
  }
};

export const generateReadingMaterial = async (level: string, topic: string): Promise<{ title: string; content: string; questions: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Gere um material de leitura didático para o nível ${level} sobre o tema: ${topic}. 
  O retorno deve ser obrigatoriamente um objeto JSON com as propriedades: 'title' (título do texto), 'content' (o texto completo) e 'questions' (um array de 3 a 5 perguntas de compreensão).`;

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
          },
          required: ["title", "content", "questions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro na geração de texto Gemini:", error);
    throw new Error("Falha ao gerar o material pedagógico. Tente um tema diferente.");
  }
};
