import React, { useState } from 'react';
import { generateReadingMaterial } from '../services/geminiService';
import { Sparkles, Printer, Copy, RefreshCw } from 'lucide-react';
import { ReadingMaterial } from '../types';

export const TextGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('2º Ano Fundamental');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadingMaterial | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await generateReadingMaterial(level, topic);
      setResult({
        ...data,
        level: level,
        suggestedQuestions: data.questions
      });
    } catch (err) {
      setError('Erro ao gerar texto. Tente novamente ou verifique sua API Key.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      const text = `${result.title}\n\n${result.content}\n\nPerguntas:\n${result.suggestedQuestions.join('\n')}`;
      navigator.clipboard.writeText(text);
      alert("Texto copiado!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-300" />
          Gerador de Material
        </h1>
        <p className="opacity-90 max-w-xl">
          Use Inteligência Artificial para criar textos personalizados e inéditos para leitura em sala de aula, adaptados ao nível dos seus alunos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível Escolar</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option>1º Ano Fundamental</option>
                <option>2º Ano Fundamental</option>
                <option>3º Ano Fundamental</option>
                <option>4º Ano Fundamental</option>
                <option>5º Ano Fundamental</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tema / Assunto</label>
              <input 
                type="text"
                required
                placeholder="Ex: Dinossauros, Espaço, Amizade..."
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${
                loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'
              }`}
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'Criando...' : 'Gerar Texto'}
            </button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </div>

        {/* Result */}
        <div className="md:col-span-2">
          {result ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">{result.title}</h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-serif">
                  {result.content.split('\n').map((p, i) => (
                    <p key={i} className="mb-4">{p}</p>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-purple-50 border-t border-purple-100">
                <h3 className="font-semibold text-purple-900 mb-3">Perguntas de Compreensão Sugeridas:</h3>
                <ul className="list-disc list-inside space-y-2 text-purple-800">
                  {result.suggestedQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-200">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                  <Copy className="w-4 h-4" /> Copiar Tudo
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <BookOpen size={48} className="mb-4 opacity-50" />
              <p>O texto gerado pela IA aparecerá aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple Icon fallback
const BookOpen = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);