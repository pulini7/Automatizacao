import React from 'react';
import { CommonData } from '../types';
import { Gavel, User, FileText, Briefcase, BookOpen, CheckSquare } from 'lucide-react';

interface Props {
  data: CommonData;
  onChange: (data: CommonData) => void;
  onNext: () => void;
}

const CommonForm: React.FC<Props> = ({ data, onChange, onNext }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const isFormValid = data.plaintiffName && data.lawyerName && data.court && data.plaintiffDoc;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Juízo */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Gavel className="w-5 h-5 text-indigo-600" />
          Endereçamento
        </h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Juízo Competente</label>
          <input
            type="text"
            name="court"
            value={data.court}
            onChange={handleChange}
            placeholder="Ex: Excelentíssimo Senhor Doutor Juiz de Direito da Xª Vara Cível da Comarca de..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* 2. Qualificação do Autor */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-indigo-600" />
          Qualificação do Autor
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input
              type="text"
              name="plaintiffName"
              value={data.plaintiffName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ/CPF</label>
            <input
              type="text"
              name="plaintiffDoc"
              value={data.plaintiffDoc}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">RG (Opcional se PJ)</label>
            <input
              type="text"
              name="plaintiffRG"
              value={data.plaintiffRG || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado Civil (Opcional)</label>
            <input
              type="text"
              name="plaintiffCivilStatus"
              value={data.plaintiffCivilStatus || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Casado"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Profissão (Opcional)</label>
            <input
              type="text"
              name="plaintiffProfession"
              value={data.plaintiffProfession || ''}
              onChange={handleChange}
              placeholder="Ex: Engenheiro"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo (com CEP)</label>
            <input
              type="text"
              name="plaintiffAddress"
              value={data.plaintiffAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Advogado */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          Dados do Advogado
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Advogado</label>
            <input
              type="text"
              name="lawyerName"
              value={data.lawyerName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">OAB</label>
            <input
              type="text"
              name="lawyerOAB"
              value={data.lawyerOAB}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Profissional</label>
            <input
              type="text"
              name="lawyerAddress"
              value={data.lawyerAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Textos Padrões (Fatos, Direito, Pedidos) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-indigo-600" />
          Textos Padrões da Petição
        </h2>
        
        {/* Fatos Base */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
             <FileText className="w-4 h-4" /> 1. Dos Fatos (Parte Fixa)
          </label>
          <p className="text-xs text-slate-500 mb-2">
             Este texto será complementado automaticamente com as variáveis de cada caso (Bloco, Apto, Valores).
          </p>
          <textarea
            name="baseFacts"
            value={data.baseFacts}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Direito Base */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
             <BookOpen className="w-4 h-4" /> 2. Do Direito (Parte Fixa)
          </label>
          <p className="text-xs text-slate-500 mb-2">
             Argumentação jurídica que se aplica a todos os casos.
          </p>
          <textarea
            name="baseRights"
            value={data.baseRights || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Pedidos Base */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
             <CheckSquare className="w-4 h-4" /> 3. Dos Pedidos (Parte Fixa)
          </label>
          <p className="text-xs text-slate-500 mb-2">
             Lista de pedidos. A IA irá inserir o <strong>valor atualizado</strong> específico de cada caso onde for pertinente.
          </p>
          <textarea
            name="baseRequests"
            value={data.baseRequests || ''}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all ${
            isFormValid 
              ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200' 
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          Próximo: Cadastrar Casos &rarr;
        </button>
      </div>
    </div>
  );
};

export default CommonForm;