import React, { useState } from 'react';
import { CommonData, CaseData, AppStep } from './types';
import CommonForm from './components/CommonForm';
import CaseManager from './components/CaseManager';
import ResultViewer from './components/ResultViewer';
import { Scale, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  
  // State for Common Data - Pré-preenchido conforme solicitado
  const [commonData, setCommonData] = useState<CommonData>({
    court: 'Excelentíssimo Senhor Doutor Juiz de Direito da ___ Vara Cível da Comarca de São Paulo/SP',
    plaintiffName: 'Condomínio Edifício Residencial Solar das Flores',
    plaintiffDoc: '12.345.678/0001-90',
    plaintiffRG: '',
    plaintiffCivilStatus: '',
    plaintiffProfession: '',
    plaintiffAddress: 'Rua das Acácias, 123, Jardim Botânico, São Paulo/SP, CEP 01234-567',
    lawyerName: 'Dr. João Pulini', // Ajustado contexto
    lawyerOAB: 'OAB/SP 999.999',
    lawyerAddress: 'Endereço Comercial, Bauru/SP',
    baseFacts: 'O Autor é um condomínio edilício regularmente constituído, conforme Convenção Condominial anexa. As despesas ordinárias e extraordinárias cobradas foram devidamente aprovadas em Assembleia Geral Ordinária e possuem força de título executivo. O Réu, na qualidade de titular da unidade, deixou de adimplir com sua obrigação de rateio das despesas comuns, onerando a coletividade.',
    baseRights: 'A obrigação de contribuir com as despesas condominiais está prevista no art. 1.336, I, do Código Civil, bem como na Lei 4.591/64. O inadimplemento constitui infração legal e contratual, sujeitando o devedor ao pagamento do principal acrescido de juros moratórios de 1% ao mês, multa de 2% e correção monetária, conforme art. 1.336, §1º do CC e a Convenção do Condomínio. O Código de Processo Civil, em seu art. 784, X, confere às cotas condominiais a natureza de título executivo extrajudicial.',
    baseRequests: 'a) A citação do Réu para comparecer à audiência de conciliação e responder aos termos da presente ação;\nb) A procedência total dos pedidos para condenar o Réu ao pagamento do valor atualizado da dívida (VARIÁVEL), acrescido das parcelas que se vencerem no curso do processo (art. 323 do CPC), devidamente corrigidas e com juros de mora;\nc) A condenação do Réu ao pagamento de custas processuais e honorários advocatícios na base de 20% sobre o valor da condenação.'
  });

  // State for Cases
  const [cases, setCases] = useState<CaseData[]>([]);

  const renderStep = () => {
    switch (step) {
      case AppStep.SETUP:
        return (
          <CommonForm 
            data={commonData} 
            onChange={setCommonData} 
            onNext={() => setStep(AppStep.CASES)} 
          />
        );
      case AppStep.CASES:
        return (
          <CaseManager 
            cases={cases} 
            setCases={setCases} 
            onNext={() => setStep(AppStep.RESULTS)}
            onBack={() => setStep(AppStep.SETUP)}
          />
        );
      case AppStep.RESULTS:
        return (
          <ResultViewer 
            commonData={commonData} 
            cases={cases} 
            setCases={setCases}
            onBack={() => setStep(AppStep.CASES)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg">
                <Scale className="w-6 h-6 text-indigo-300" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AutoJus <span className="text-indigo-300 font-light">| Petições em Massa</span></h1>
          </div>
          <div className="text-sm text-indigo-200">
            {cases.length > 0 ? `${cases.length} caso(s) registrado(s)` : 'Nova Sessão'}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            {/* Connector Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= AppStep.SETUP ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                1
              </div>
              <span className={`text-xs font-medium ${step >= AppStep.SETUP ? 'text-indigo-900' : 'text-slate-400'}`}>Dados Comuns</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= AppStep.CASES ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
              </div>
              <span className={`text-xs font-medium ${step >= AppStep.CASES ? 'text-indigo-900' : 'text-slate-400'}`}>Casos (Devedores)</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= AppStep.RESULTS ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                3
              </div>
              <span className={`text-xs font-medium ${step >= AppStep.RESULTS ? 'text-indigo-900' : 'text-slate-400'}`}>Gerar & Baixar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStep()}
      </main>
    </div>
  );
};

export default App;