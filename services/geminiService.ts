import { GoogleGenAI, Type } from "@google/genai";
import { Assessment, Student } from "../types";

// Always use the environment variable directly for API key initialization.
// The key is assumed to be provided and valid in the execution context.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

/**
 * Generates a pedagogical analysis of a student based on their assessment history (Reading + Math).
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
        const comp = Object.entries(c.comprehension).filter(([,v]) => v).length;
        const math = c.math ? Object.entries(c.math).filter(([,v]) => v).length : 0;
        details = ` | FluÃªncia: ${fluency}/4, CompreensÃ£o: ${comp}/5, MatemÃ¡tica: ${math}/5. Notas: L:${a.comprehension}, M:${a.mathScore || 'N/A'}`;
      }
      return `Data: ${a.date}, WPM: ${a.wpm}, PrecisÃ£o: ${a.accuracy}%${details}. Obs: ${a.notes}`;
    })
    .join('\n');

  const prompt = `
    Atue como um especialista pedagÃ³gico multidisciplinar em alfabetizaÃ§Ã£o e educaÃ§Ã£o bÃ¡sica.
    Analise o progresso do aluno abaixo considerando tanto a LEITURA quanto a MATEMÃTICA.

    Aluno: ${student.name} 
    SÃ©rie: ${student.grade || 'N/A'}
    NÃ­vel de Leitura Atual: ${student.readingLevel}
    
    HistÃ³rico recente de avaliaÃ§Ãµes:
    ${recentHistory}
    
    ForneÃ§a um relatÃ³rio curto e construtivo em Markdown:
    1. **Desempenho em Leitura**: SÃ­ntese da fluÃªncia e compreensÃ£o.
    2. **Desenvolvimento MatemÃ¡tico**: AnÃ¡lise das competÃªncias numÃ©ricas e raciocÃ­nio.
    3. **SugestÃµes de IntervenÃ§Ã£o**: 3 atividades prÃ¡ticas que integrem as duas Ã¡reas ou foquem na maior dificuldade.
    
    Seja especÃ­fico e encorajador.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text || "NÃ£o foi possÃ­vel gerar a anÃ¡lise no momento.";
  } catch (error) {
    console.error("Erro ao gerar anÃ¡lise:", error);
    return "Erro ao conectar com a IA.";
  }
};

/**
 * Generates reading material and comprehension questions based on level and topic.
 */
export const generateReadingMaterial = async (level: string, topic: string): Promise<{ title: string; content: string; questions: string[] }> => {
  const prompt = `Gere um material de leitura pedagÃ³gico para o nÃ­vel escolar: ${level}.
    O tema Ã©: ${topic}.
    O material deve conter um tÃ­tulo criativo, um texto adequado para a sÃ©rie e 3 perguntas de compreensÃ£o.`;

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
              description: 'TÃ­tulo do texto de leitura.'
            },
            content: { 
              type: Type.STRING,
              description: 'O texto completo para o aluno ler.'
            },
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'TrÃªs perguntas de compreensÃ£o sobre o texto.'
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