import React, { useState } from 'react';
import { Competency } from '../types';
import { Plus, Award, Trash2, Edit2, AlertCircle, Info } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Competências</h1>
          <p className="text-gray-500 text-sm">Defina os critérios de avaliação e seus respectivos pesos</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Competência
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Configuração de Pesos</h2>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${totalWeight === 100 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
            <Info className="w-4 h-4" />
            Total: {totalWeight}%
            {totalWeight !== 100 && <span className="text-[10px] font-normal block">(Recomendado: 100%)</span>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-semibold text-gray-600 text-sm">Nome / Categoria</th>
                <th className="pb-4 font-semibold text-gray-600 text-sm">Descrição</th>
                <th className="pb-4 font-semibold text-gray-600 text-sm">Peso (Valor)</th>
                <th className="pb-4 font-semibold text-gray-600 text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {competencies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                    Nenhuma competência cadastrada.
                  </td>
                </tr>
              ) : (
                competencies.map((comp) => (
                  <tr key={comp.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{comp.name}</div>
                      <div className="text-xs text-primary-600 font-medium">{comp.category}</div>
                    </td>
                    <td className="py-4 text-sm text-gray-600 max-w-xs truncate" title={comp.description}>
                      {comp.description}
                    </td>
                    <td className="py-4">
                      <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm font-bold text-gray-700">
                        {comp.weight}%
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(comp)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(comp.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-fade-in">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {compToEdit ? 'Editar Competência' : 'Nova Competência'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Competência</label>
            <input 
              required 
              type="text" 
              placeholder="Ex: Velocidade de Leitura"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select 
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (0 a 100)</label>
            <input 
              required 
              type="number" 
              min="0"
              max="100"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none" 
              value={formData.weight} 
              onChange={e => setFormData({...formData, weight: parseInt(e.target.value) || 0})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea 
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none resize-none" 
              placeholder="Descreva o que será avaliado..."
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};