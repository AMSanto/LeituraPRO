
import { GoogleGenAI, Type } from "@google/genai";
import { Assessment, Student } from "../types";

// Always use the environment variable directly for API key initialization.
// The key is assumed to be provided and valid in the execution context.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a pedagogical analysis of a student based on their assessment history.
 */
export const generateStudentAnalysis = async (student: Student & { grade?: string }, assessments: Assessment[]): Promise<string> => {
  // Get last 3 assessments
  const recentHistory = assessments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(a => {
      let details = '';
      if (a.criteria) {
        const c = a.criteria;
        const fluency = Object.entries(c.fluency).filter(([,v]) => v).length;
        const decoding = Object.entries(c.decoding).filter(([,v]) => v).length;
        const comp = Object.entries(c.comprehension).filter(([,v]) => v).length;
        details = ` | Critérios Atendidos - Fluência: ${fluency}/4, Decodificação: ${decoding}/3, Compreensão: ${comp}/5`;
      }
      return `Data: ${a.date}, WPM: ${a.wpm}, Precisão: ${a.accuracy}%, Comp: ${a.comprehension}/10${details}. Obs: ${a.notes}`;
    })
    .join('\n');

  const prompt = `
    Atue como um especialista pedagógico em alfabetização e letramento.
    Analise o progresso do aluno abaixo e forneça um relatório curto e construtivo.

    Aluno: ${student.name} 
    Série: ${student.grade || 'N/A'}
    Nível de Leitura Atual: ${student.readingLevel}
    
    Histórico recente de avaliações:
    ${recentHistory}
    
    Critérios avaliados incluem: Ritmo, Entonação, Decodificação sem soletrar, Inferência e Ideia Principal.

    Estrutura da resposta (em Markdown):
    1. **Pontos Fortes**: O que o aluno já domina.
    2. **Áreas de Atenção**: Onde há dificuldades (ex: ritmo, inferência, decodificação).
    3. **Sugestões Práticas**: 3 atividades específicas para pais ou professores aplicarem.
    
    Seja encorajador e específico.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao gerar análise:", error);
    return "Erro ao conectar com a IA.";
  }
};

/**
 * Generates reading material and comprehension questions based on level and topic.
 */
export const generateReadingMaterial = async (level: string, topic: string): Promise<{ title: string; content: string; questions: string[] }> => {
  const prompt = `Gere um material de leitura pedagógico para o nível escolar: ${level}.
    O tema é: ${topic}.
    O material deve conter um título criativo, um texto adequado para a série e 3 perguntas de compreensão.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { 
              type: Type.STRING,
              description: 'Título do texto de leitura.'
            },
            content: { 
              type: Type.STRING,
              description: 'O texto completo para o aluno ler.'
            },
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Três perguntas de compreensão sobre o texto.'
            }
          },
          required: ["title", "content", "questions"],
          propertyOrdering: ["title", "content", "questions"]
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Resposta da IA vazia.");
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro ao gerar material de leitura:", error);
    throw error;
  }
};
