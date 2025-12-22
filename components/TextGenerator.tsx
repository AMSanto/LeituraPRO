
import React, { useState } from 'react';
import { generateReadingMaterial } from '../services/geminiService';
import { Sparkles, Printer, Copy, RefreshCw, BookOpen } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2rem] p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 flex items-center gap-3 md:gap-4 uppercase tracking-tighter">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-yellow-300" />
            Gerador IA
          </h1>
          <p className="opacity-90 text-sm md:text-lg font-medium leading-relaxed">
            Crie textos didáticos exclusivos para leitura em sala de aula, adaptados instantaneamente ao nível escolar dos seus alunos.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nível Escolar</label>
              <select 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-sm"
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
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tema Desejado</label>
              <input 
                type="text"
                required
                placeholder="Ex: Dinossauros, Espaço, Amizade..."
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-sm"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 md:py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
                loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'PROCESSANDO...' : 'GERAR MATERIAL'}
            </button>
            {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase mt-2">{error}</p>}
          </form>
        </div>

        {/* Result */}
        <div className="lg:col-span-8">
          {result ? (
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 md:p-12 border-b border-gray-100">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 text-center uppercase tracking-tighter leading-tight">{result.title}</h2>
                <div className="prose prose-sm md:prose-lg max-w-none text-gray-700 leading-relaxed font-serif">
                  {result.content.split('\n').filter(p => p.trim()).map((p, i) => (
                    <p key={i} className="mb-6 indent-8">{p}</p>
                  ))}
                </div>
              </div>
              
              <div className="p-6 md:p-8 bg-primary-50/50 border-t border-primary-100">
                <h3 className="font-black text-[10px] md:text-xs text-primary-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <BookOpen size={14} /> Compreensão Sugerida
                </h3>
                <ul className="space-y-3">
                  {result.suggestedQuestions.map((q, i) => (
                    <li key={i} className="flex gap-3 text-xs md:text-sm font-bold text-primary-900 leading-relaxed">
                       <span className="shrink-0 w-6 h-6 rounded-lg bg-primary-200 flex items-center justify-center text-[10px]">{i+1}</span>
                       {q}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 md:p-6 bg-gray-50 flex flex-col sm:row justify-end gap-3 border-t border-gray-100">
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-3 text-gray-500 hover:bg-gray-200 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-black rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
                >
                  <Copy className="w-4 h-4" /> Copiar Tudo
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center text-gray-400 border-4 border-dashed border-gray-50 rounded-[2rem] bg-white shadow-inner p-8 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                <BookOpen size={48} className="opacity-20" />
              </div>
              <p className="font-black text-[10px] md:text-xs uppercase tracking-[0.3em] opacity-50">O material gerado aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
