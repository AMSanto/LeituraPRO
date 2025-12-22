
import React, { useState } from 'react';
import { Competency } from '../types';
import { Plus, Award, Trash2, Edit2, Info, X } from 'lucide-react';

interface CompetencyManagerProps {
  competencies: Competency[];
  onAdd: (comp: Omit<Competency, 'id'>) => void;
  onUpdate: (comp: Competency) => void;
  onDelete: (id: string) => void;
}

export const CompetencyManager: React.FC<CompetencyManagerProps> = ({ 
  competencies, 
  onAdd, 
  onUpdate, 
  onDelete 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competency | null>(null);

  const totalWeight = competencies.reduce((acc, curr) => acc + curr.weight, 0);

  const handleOpenAdd = () => {
    setEditingComp(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: Competency) => {
    setEditingComp(comp);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase">Gerenciar Critérios</h1>
          <p className="text-gray-500 text-xs md:text-sm">Defina os parâmetros de avaliação e seus pesos</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black transition-all shadow-lg shadow-rose-600/20 active:scale-95 text-xs uppercase tracking-widest"
        >
          <Plus size={18} />
          Novo Critério
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 p-3 rounded-2xl text-rose-600"><Award size={24} /></div>
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Configuração de Pesos</h2>
          </div>
          <div className={`px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 text-[10px] uppercase tracking-widest border ${totalWeight === 100 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
            <Info size={14} />
            Total: {totalWeight}%
            {totalWeight !== 100 && <span className="opacity-60 text-[8px] ml-1">(Ideal: 100%)</span>}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Critério / Categoria</th>
                <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Descrição Técnica</th>
                <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Peso</th>
                <th className="p-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {competencies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 uppercase text-[10px] font-black tracking-widest italic opacity-50">
                    Nenhuma competência cadastrada no sistema.
                  </td>
                </tr>
              ) : (
                competencies.map((comp) => (
                  <tr key={comp.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="p-5">
                      <div className="font-black text-gray-900 text-sm uppercase leading-tight mb-1">{comp.name}</div>
                      <div className="text-[9px] text-rose-600 font-black uppercase tracking-widest">{comp.category}</div>
                    </td>
                    <td className="p-5 text-xs text-gray-500 font-medium max-w-xs truncate" title={comp.description}>
                      {comp.description}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <div className="inline-flex items-center px-4 py-1.5 bg-gray-100 rounded-full text-xs font-black text-gray-700 uppercase">
                          {comp.weight}%
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(comp)}
                          className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(comp.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CompetencyModal 
          compToEdit={editingComp}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            if (editingComp) {
              onUpdate({ ...editingComp, ...data });
            } else {
              onAdd(data);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const CompetencyModal: React.FC<{ 
  compToEdit: Competency | null; 
  onClose: () => void; 
  onSave: (data: Omit<Competency, 'id'>) => void 
}> = ({ compToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: compToEdit?.name || '',
    description: compToEdit?.description || '',
    category: compToEdit?.category || 'Geral' as any,
    weight: compToEdit?.weight || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 md:p-10 shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh] custom-scrollbar ring-1 ring-black/5">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
             {compToEdit ? 'Editar Critério' : 'Novo Critério'}
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nome do Critério</label>
            <input 
              required 
              type="text" 
              placeholder="Ex: Velocidade de Leitura"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-rose-500 font-bold outline-none text-sm" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Categoria</label>
              <select 
                required
                className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-rose-500 font-bold outline-none text-sm"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as any})}
              >
                <option value="Leitura">Leitura</option>
                <option value="Matemática">Matemática</option>
                <option value="Socioemocional">Socioemocional</option>
                <option value="Geral">Geral</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Peso (0 a 100%)</label>
              <input 
                required 
                type="number" 
                min="0"
                max="100"
                className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-rose-500 font-bold outline-none text-sm" 
                value={formData.weight} 
                onChange={e => setFormData({...formData, weight: parseInt(e.target.value) || 0})} 
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Descrição Técnica</label>
            <textarea 
              rows={3}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-rose-500 font-bold outline-none text-sm resize-none" 
              placeholder="Descreva o que será avaliado..."
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest">CANCELAR</button>
            <button type="submit" className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all active:scale-95">SALVAR CRITÉRIO</button>
          </div>
        </form>
      </div>
    </div>
  );
};
