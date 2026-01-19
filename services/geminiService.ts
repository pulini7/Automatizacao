import { GoogleGenAI } from "@google/genai";
import { CaseData, CommonData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePetitionForCase = async (
  common: CommonData,
  caseItem: CaseData
): Promise<string> => {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Atue como um advogado brasileiro especialista em Processo Civil.
    
    Sua tarefa é redigir uma **Petição Inicial** completa.
    
    A estrutura e as variáveis DEVEM seguir estritamente os pontos abaixo solicitados:
    
    **1. ENDEREÇAMENTO:**
    Ao juízo: ${common.court}

    **2. QUALIFICAÇÃO DO AUTOR (Completa):**
    O autor é: **${common.plaintiffName}**, nacionalidade (brasileiro), estado civil **${common.plaintiffCivilStatus || '[INSERIR ESTADO CIVIL]'}**, profissão **${common.plaintiffProfession || '[INSERIR PROFISSÃO]'}**, portador do RG nº **${common.plaintiffRG || '[INSERIR RG]'}** e inscrito no CPF/CNPJ sob o nº **${common.plaintiffDoc}**, residente e domiciliado na **${common.plaintiffAddress}**.
    
    *Representado por seu advogado:* ${common.lawyerName}, OAB ${common.lawyerOAB}, endereço ${common.lawyerAddress}.

    **3. QUALIFICAÇÃO DO RÉU:**
    ${caseItem.defendantName}, CPF/CNPJ ${caseItem.defendantDoc}, endereço: ${caseItem.defendantAddress || `residente na Unidade ${caseItem.unit}, Bloco ${caseItem.block}, no mesmo endereço do autor, se aplicável, ou inserir endereço completo.`}.

    **4. DOS FATOS:**
    Utilize EXATAMENTE o texto base abaixo, mas complemente-o com as variáveis do caso:
    "${common.baseFacts}"
    
    Váriaveis a inserir nos fatos:
    - Unidade: **Apto ${caseItem.unit}**, **Bloco ${caseItem.block}**.
    - Parcelas em atraso: **${caseItem.dueInstallments}**.
    - Valor original: **R$ ${caseItem.originalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.
    - Valor atualizado: **R$ ${caseItem.updatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.

    **5. DO DIREITO:**
    Utilize EXATAMENTE o texto base abaixo:
    "${common.baseRights}"

    **6. DOS PEDIDOS:**
    Utilize o texto base abaixo como lista de pedidos.
    IMPORTANTE: Dentro dos pedidos, onde houver menção ao valor da causa ou condenação, INSERIR o valor atualizado deste caso (**R$ ${caseItem.updatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**).
    
    Texto base dos pedidos:
    "${common.baseRequests}"

    **ESTRUTURA FINAL:**
    - Endereçamento
    - Qualificação das Partes
    - Fatos (Texto base + Variáveis)
    - Fundamentação Jurídica (Texto base)
    - Pedidos (Texto base + Variável de Valor)
    - Valor da Causa: R$ ${caseItem.updatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    - Data e Assinatura

    Use formatação Markdown profissional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.1, // Temperatura baixa para ser fiel aos textos bases
      }
    });

    return response.text || "Erro ao gerar texto.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha na comunicação com a IA.");
  }
};