import React, { useState, useRef } from 'react';
import { CaseData } from '../types';
import { Plus, Trash2, Edit2, Users, DollarSign, Briefcase, Upload, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  cases: CaseData[];
  setCases: React.Dispatch<React.SetStateAction<CaseData[]>>;
  onNext: () => void;
  onBack: () => void;
}

const emptyCase: Omit<CaseData, 'id'> = {
  defendantName: '',
  defendantDoc: '',
  defendantAddress: '',
  unit: '',
  block: '',
  dueInstallments: '',
  originalValue: 0,
  updatedValue: 0,
  specifics: '',
  status: 'pending'
};

const CaseManager: React.FC<Props> = ({ cases, setCases, onNext, onBack }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState<Omit<CaseData, 'id'>>(emptyCase);
  const [editId, setEditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentCase(prev => ({
      ...prev,
      [name]: (name === 'originalValue' || name === 'updatedValue') ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = () => {
    if (!currentCase.defendantName || !currentCase.updatedValue) return;

    if (editId) {
      setCases(prev => prev.map(c => c.id === editId ? { ...c, ...currentCase } : c));
      setEditId(null);
    } else {
      const newCase: CaseData = {
        ...currentCase,
        id: crypto.randomUUID(),
        status: 'pending'
      };
      setCases(prev => [...prev, newCase]);
    }
    setCurrentCase(emptyCase);
    setIsFormOpen(false);
  };

  const handleEdit = (c: CaseData) => {
    setCurrentCase(c);
    setEditId(c.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Ler como JSON
      const data = XLSX.utils.sheet_to_json(ws);
      
      const newCases: CaseData[] = data.map((row: any) => ({
        id: crypto.randomUUID(),
        defendantName: row['Nome'] || row['NOME'] || row['Devedor'] || '',
        defendantDoc: row['CPF'] || row['cpf'] || row['CNPJ'] || '',
        defendantAddress: row['Endereco'] || row['Endereço'] || '',
        unit: String(row['Unidade'] || row['Apto'] || row['Apartamento'] || ''),
        block: String(row['Bloco'] || row['Torre'] || ''),
        dueInstallments: String(row['Parcelas'] || row['Meses'] || ''),
        originalValue: parseFloat(row['ValorOriginal'] || row['Valor Original'] || 0),
        updatedValue: parseFloat(row['ValorAtualizado'] || row['Valor Atualizado'] || row['Total'] || 0),
        specifics: '',
        status: 'pending'
      })).filter(c => c.defendantName && c.updatedValue > 0); // Filtra linhas vazias ou inválidas

      setCases(prev => [...prev, ...newCases]);
      alert(`${newCases.length} casos importados com sucesso!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 
        Nome: "João da Silva", 
        CPF: "123.456.789-00", 
        Unidade: "101", 
        Bloco: "A", 
        Parcelas: "Jan/24, Fev/24", 
        "Valor Original": 1000.50, 
        "Valor Atualizado": 1250.00,
        "Endereço": "Opcional (se diferente do apto)"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    XLSX.writeFile(wb, "Modelo_Importacao_AutoJus.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Casos Individuais</h2>
          <p className="text-slate-500">Cadastre manualmente ou importe via Excel.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <input 
             type="file" 
             accept=".xlsx, .xls" 
             className="hidden" 
             ref={fileInputRef}
             onChange={handleFileUpload}
           />
           <button
            onClick={() => downloadTemplate()}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300 text-sm font-medium"
           >
             <Download className="w-4 h-4" />
             Baixar Modelo
           </button>
           <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
           >
             <FileSpreadsheet className="w-4 h-4" />
             Importar Excel
           </button>
           <button
            onClick={() => { setIsFormOpen(true); setEditId(null); setCurrentCase(emptyCase); }}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo Manual
          </button>
        </div>
      </div>

      {/* Case Entry Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editId ? 'Editar Caso' : 'Novo Caso'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Defendant Info */}
               <div className="md:col-span-2">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Users className="w-3 h-3"/> Réu (Devedor)</h4>
               </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Nome do Réu</label>
                <input name="defendantName" value={currentCase.defendantName} onChange={handleInputChange} className="input-std" placeholder="Nome completo" />
               </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">CPF/CNPJ</label>
                <input name="defendantDoc" value={currentCase.defendantDoc} onChange={handleInputChange} className="input-std" placeholder="000.000.000-00" />
               </div>

               {/* Property Info */}
               <div className="md:col-span-2 mt-2">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Briefcase className="w-3 h-3"/> Variaveis dos Fatos</h4>
               </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Número do Apartamento</label>
                <input name="unit" value={currentCase.unit} onChange={handleInputChange} className="input-std" placeholder="Ex: 101" />
               </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Bloco</label>
                <select name="block" value={currentCase.block} onChange={handleInputChange} className="input-std bg-white">
                  <option value="">Selecione...</option>
                  <option value="A">Bloco A</option>
                  <option value="B">Bloco B</option>
                  <option value="C">Bloco C</option>
                  <option value="Único">Único</option>
                </select>
               </div>
               <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Número de Parcelas Devidas</label>
                <input name="dueInstallments" value={currentCase.dueInstallments} onChange={handleInputChange} className="input-std" placeholder="Ex: 5 parcelas (Jan a Mai/2024)" />
               </div>

               {/* Debt Info */}
               <div className="md:col-span-2 mt-2">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Valores</h4>
               </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Valor Original da Dívida</label>
                <input type="number" step="0.01" name="originalValue" value={currentCase.originalValue} onChange={handleInputChange} className="input-std" />
               </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Valor Atualizado (Pedidos)</label>
                <input type="number" step="0.01" name="updatedValue" value={currentCase.updatedValue} onChange={handleInputChange} className="input-std font-bold text-indigo-700" />
               </div>
               
               <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-medium text-slate-700">Endereço do Réu (Opcional se for o mesmo)</label>
                <input name="defendantAddress" value={currentCase.defendantAddress} onChange={handleInputChange} className="input-std" placeholder="Deixe em branco se residir na unidade devedora" />
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Salvar Caso</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {cases.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum caso cadastrado ainda.</p>
            <p className="text-sm mt-2">Clique em "Importar Excel" para carregar múltiplos devedores de uma vez.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Devedor</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Imóvel</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Parcelas</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Dívida Atualizada</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {c.defendantName}
                      <div className="text-xs text-slate-500">{c.defendantDoc}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">Apto {c.unit} - Bloco {c.block}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={c.dueInstallments}>{c.dueInstallments}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">R$ {c.updatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEdit(c)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-full"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 px-4 py-2">
          &larr; Voltar
        </button>
        <button
          onClick={onNext}
          disabled={cases.length === 0}
          className={`px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all ${
            cases.length > 0 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          Próximo: Gerar Petições ({cases.length}) &rarr;
        </button>
      </div>
      
      <style>{`
        .input-std {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-std:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CaseManager;