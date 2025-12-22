
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Assessment, Student } from "../types";

export const generateStudentAnalysis = async (student: Student & { grade?: string }, assessments: Assessment[]): Promise<string> => {
  if (assessments.length === 0) return "Sem avaliações suficientes para uma análise estatística relevante.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Você é um consultor pedagógico sênior especializado em alfabetização. 
  Analise o progresso de leitura do aluno ${student.name}. 
  Perfil atual: ${student.readingLevel}. 
  Histórico de avaliações (JSON): ${JSON.stringify(assessments)}. 
  
  Sua tarefa: Forneça um relatório executivo curto (máx 4 parágrafos) cobrindo:
  1. Tendência de evolução da fluência (WPM).
  2. Lacunas identificadas em decodificação ou compreensão.
  3. Sugestão de intervenção prática imediata.
  Use um tom profissional, acolhedor e focado em dados.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Análise indisponível no momento.";
  } catch (error) {
    console.error("Erro Gemini Analysis:", error);
    return "Erro técnico ao gerar análise. Verifique a conexão com o motor de IA.";
  }
};

export const generateReadingMaterial = async (level: string, topic: string): Promise<{ title: string; content: string; questions: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Gere um material pedagógico original para o nível "${level}" sobre "${topic}".
  O texto deve ser didático, ter entre 150 e 300 palavras.
  Inclua 3 perguntas de interpretação, sendo uma literal, uma inferencial e uma crítica.
  Retorne APENAS um JSON válido.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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

    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro Gemini Generator:", error);
    throw new Error("Não foi possível gerar o material pedagógico. Tente um tema mais específico.");
  }
};
