import React, { useState, useEffect } from 'react';
import { CaseData, CommonData } from '../types';
import { generatePetitionForCase } from '../services/geminiService';
import { generateDocx } from '../services/docxGenerator';
import { CheckCircle2, Loader2, AlertCircle, Copy, Download, ChevronRight, FileArchive, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';

interface Props {
  commonData: CommonData;
  cases: CaseData[];
  setCases: React.Dispatch<React.SetStateAction<CaseData[]>>;
  onBack: () => void;
}

const ResultViewer: React.FC<Props> = ({ commonData, cases, setCases, onBack }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(cases.length > 0 ? cases[0].id : null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  // Function to generate a single case
  const generateSingle = async (caseId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'generating' } : c));

    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    try {
      const text = await generatePetitionForCase(commonData, targetCase);
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'completed', generatedText: text } : c));
    } catch (error) {
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'error' } : c));
    }
  };

  const generateAllPending = async () => {
    setIsGeneratingAll(true);
    const pendingCases = cases.filter(c => c.status === 'pending' || c.status === 'error');
    
    // Process purely sequentially to ensure stability
    for (const c of pendingCases) {
       await generateSingle(c.id);
       await new Promise(r => setTimeout(r, 500));
    }
    setIsGeneratingAll(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Texto copiado para a área de transferência!");
  };

  const downloadAllAsZip = async () => {
    const completedCases = cases.filter(c => c.status === 'completed' && c.generatedText);
    if (completedCases.length === 0) {
        alert("Nenhuma petição concluída para baixar.");
        return;
    }

    setIsZipping(true);
    const zip = new JSZip();

    try {
        // Gera arquivos DOCX em paralelo
        await Promise.all(completedCases.map(async (c) => {
            const blob = await generateDocx(c.generatedText || "");
            const safeName = c.defendantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            zip.file(`peticao_${safeName}_unidade_${c.unit}.docx`, blob);
        }));

        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `peticoes_word_pulini_${new Date().toISOString().slice(0,10)}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Failed to zip", e);
        alert("Erro ao criar arquivo ZIP.");
    } finally {
        setIsZipping(false);
    }
  };

  const progress = Math.round((cases.filter(c => c.status === 'completed').length / cases.length) * 100);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Sidebar: Case List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Progresso</h3>
                <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                    {progress}% Concluído
                </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <button
                    onClick={generateAllPending}
                    disabled={isGeneratingAll || cases.every(c => c.status === 'completed')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-colors"
                >
                    {isGeneratingAll ? <Loader2 className="w-4 h-4 animate-spin"/> : <ChevronRight className="w-4 h-4"/>}
                    {isGeneratingAll ? 'Gerando em Lote...' : '1. Gerar Todas'}
                </button>
                
                <button
                    onClick={downloadAllAsZip}
                    disabled={isZipping || cases.filter(c => c.status === 'completed').length === 0}
                    className="w-full py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-colors"
                >
                    {isZipping ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileText className="w-4 h-4"/>}
                    2. Baixar Word (.docx)
                </button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {cases.map(c => (
                <div 
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all ${
                        selectedCaseId === c.id 
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-slate-800 truncate block max-w-[150px]">{c.defendantName}</span>
                        {c.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {c.status === 'generating' && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                        {c.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                        {c.status === 'pending' && <span className="w-2 h-2 rounded-full bg-slate-300 mt-1"></span>}
                    </div>
                    <div className="text-xs text-slate-500 flex justify-between">
                        <span>Apto {c.unit}</span>
                        <span>R$ {c.updatedValue.toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            ))}
        </div>
        <div className="p-3 border-t border-slate-100">
            <button onClick={onBack} className="text-xs text-slate-500 hover:text-indigo-600 underline">
                Voltar para edição
            </button>
        </div>
      </div>

      {/* Main Area: Preview (Visualização com Papel Timbrado) */}
      <div className="w-2/3 bg-slate-100 rounded-xl shadow-inner border border-slate-200 flex flex-col overflow-hidden relative">
        {selectedCase ? (
            <>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    {selectedCase.status === 'pending' && (
                        <button 
                            onClick={() => generateSingle(selectedCase.id)}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                        >
                            <Loader2 className="w-3 h-3"/> Gerar Individual
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                    {selectedCase.status === 'completed' && selectedCase.generatedText ? (
                        <div className="bg-white mx-auto shadow-xl min-h-[1000px] max-w-[21cm] p-[2cm] relative flex flex-col">
                            
                            {/* Papel Timbrado: Cabeçalho */}
                            <div className="border-b-2 border-black pb-2 mb-8">
                                <h1 className="text-5xl font-light tracking-wide text-black uppercase font-[Calibri]">PULINI</h1>
                                <p className="text-sm tracking-widest text-black uppercase font-[Calibri]">ADVOCACIA</p>
                            </div>

                            {/* Conteúdo */}
                            <div className="prose prose-sm max-w-none text-justify font-[Calibri] flex-1">
                                <ReactMarkdown>{selectedCase.generatedText}</ReactMarkdown>
                            </div>

                            {/* Papel Timbrado: Rodapé */}
                            <div className="border-t-2 border-black pt-2 mt-12 text-right text-xs font-bold text-black font-[Calibri] leading-tight">
                                <p>+55 14 99791-2815</p>
                                <p>pulini@adv.oabsp.org.br</p>
                                <p>puliniadvocacia.com.br</p>
                            </div>
                        </div>
                    ) : selectedCase.status === 'generating' ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                            <p>Redigindo minuta no padrão Pulini Advocacia...</p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <FileTextIcon />
                            <p className="mt-4">Nenhuma petição gerada para este caso ainda.</p>
                            <button 
                                onClick={() => generateSingle(selectedCase.id)}
                                className="mt-4 text-indigo-600 hover:underline"
                            >
                                Gerar agora
                            </button>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
                Selecione um caso à esquerda.
            </div>
        )}
      </div>
    </div>
  );
};

const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
        <line x1="10" x2="8" y1="9" y2="9"/>
    </svg>
)

export default ResultViewer;