export interface CommonData {
  court: string; // Excelentíssimo Senhor Doutor Juiz de Direito da...
  // Qualificação do Autor
  plaintiffName: string; 
  plaintiffDoc: string; // CPF
  plaintiffRG: string; // Novo
  plaintiffCivilStatus: string; // Novo: solteiro, casado, etc.
  plaintiffProfession: string; // Novo
  plaintiffAddress: string; // com CEP
  
  // Advogado
  lawyerName: string;
  lawyerOAB: string;
  lawyerAddress: string;
  
  baseFacts: string; // Fatos contextuais (ex: Ata da assembleia)
  baseRights: string; // Fundamentação Jurídica Padrão
  baseRequests: string; // Pedidos Padrão
}

export interface CaseData {
  id: string;
  defendantName: string;
  defendantDoc: string; // CPF/CNPJ
  defendantAddress: string; 
  
  // Variáveis dos Fatos
  unit: string; // número do apartamento
  block: string; // A ou B
  dueInstallments: string; // número de parcelas devidas (ou descrição delas)
  originalValue: number; // valor original
  updatedValue: number; // valor atualizado (usado nos Fatos e Pedidos)
  
  specifics: string; 
  status: 'pending' | 'generating' | 'completed' | 'error';
  generatedText?: string;
}

export enum AppStep {
  SETUP = 0,
  CASES = 1,
  RESULTS = 2,
}