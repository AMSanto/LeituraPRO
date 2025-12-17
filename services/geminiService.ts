import { GoogleGenAI, Type } from "@google/genai";
import { Assessment, Student } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const checkApiKey = () => {
  if (!apiKey) {
    throw new Error("API Key não encontrada.");
  }
};

export const generateStudentAnalysis = async (student: Student & { grade?: string }, assessments: Assessment[]): Promise<string> => {
  checkApiKey();

  const recentHistory = assessments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(a => {
      const subjectLabel = a.subject === 'Math' ? 'Matemática' : 'Leitura';
      return `[${subjectLabel}] Data: ${a.date}, Topico: ${a.textTitle}, Precisão/Nota: ${a.accuracy}%, Comp: ${a.comprehension}/10. Obs: ${a.notes}`;
    })
    .join('\n');

  const prompt = `
    Atue como um especialista pedagógico multidisciplinar.
    Analise o progresso do aluno abaixo em Leitura e/ou Matemática.

    Aluno: ${student.name} 
    Série: ${student.grade || 'N/A'}
    
    Histórico recente:
    ${recentHistory}
    
    Para Matemática, avalie: Raciocínio Lógico, Resolução de Problemas, Modelagem e Pensamento Crítico.
    Para Leitura, avalie: Fluência, Decodificação e Compreensão.

    Estrutura da resposta (em Markdown):
    1. **Perfil de Aprendizagem**: Resumo do momento atual do aluno.
    2. **Pontos Fortes**: Conquistas em qualquer uma das áreas.
    3. **Plano de Intervenção**: 3 atividades práticas para reforçar áreas de dificuldade (seja lógica ou alfabetização).
    4. **Socioemocional**: Comente sobre a cooperação se houver dados.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "Análise indisponível.";
  } catch (error) {
    return "Erro ao conectar com a IA educacional.";
  }
};

export const generateReadingMaterial = async (level: string, topic: string): Promise<{ title: string; content: string; questions: string[] }> => {
  checkApiKey();
  const prompt = `Crie um material didático para o nível ${level} sobre ${topic}. Se for um tema de matemática, crie um pequeno desafio contextualizado. Se for leitura, um conto curto. Retorne JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    return JSON.parse(response.text);
  } catch (error) {
    throw error;
  }
};