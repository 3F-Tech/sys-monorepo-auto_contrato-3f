import { z } from 'zod';

// Helper to validate CNPJ format (tolerante a espaços)
const cnpjRegex = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;
// Helper to validate CPF format (tolerante a espaços)
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
// Helper to validate CEP format (tolerante a espaços)
const cepRegex = /^\d{5}-?\d{3}$/;
// Helper to validate Date format (DD/MM/YYYY)
const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const contractDataSchema = z.object({
  'RAZAO SOCIAL DO CONTRATANTE': z.string().min(2, "Razão social obrigatória"),
  'CNPJ DO CONTRATANTE': z.string().transform(v => v.trim()),
  'CEP DO CONTRATANTE': z.string().transform(v => v.trim()),
  'LOGRADOURO DO CONTRATANTE': z.string().min(1, "Logradouro obrigatório"),
  'NUMERO DO CONTRATANTE': z.string().min(1, "Número obrigatório"),
  'BAIRRO DO CONTRATANTE': z.string().min(2, "Bairro obrigatório"),
  'CIDADE DO CONTRATANTE': z.string().min(2, "Cidade obrigatória"),
  'UF DO CONTRATANTE': z.string().length(2, "UF deve ter 2 letras"),
  'NOME DO REPRESENTANTE': z.string().min(3, "Nome do representante muito curto"),
  'EMAIL DO REPRESENTANTE': z.string().email("E-mail do representante obrigatório"),
  'CPF DO REPRESENTANTE': z.string().regex(cpfRegex, "CPF inválido (use 000.000.000-00)"),
  'VALOR TAXA IMPLEMENTACAO': z.string().min(1, "Taxa de implementação obrigatória"),
  'VALOR MENSALIDADE': z.string().min(1, "Valor da mensalidade obrigatório"),
  'VALOR DO PRIMEIRO PAGAMENTO': z.string().min(1, "Valor do primeiro pagamento obrigatório"),
  'DATA PRIMEIRO PAGAMENTO': z.string().regex(dateRegex, "Data inválida (use DD/MM/AAAA)"),
  'DIA VENCIMENTO MENSAL': z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val >= 1 && val <= 31, "Dia de vencimento deve ser entre 1 e 31"),
  'DATA ASSINATURA CONTRATO': z.string().regex(dateRegex, "Data inválida (use DD/MM/AAAA)"),
  'NOME TESTEMUNHA 1': z.string().min(3, "Nome da testemunha muito curto").optional().or(z.literal('')),
  'EMAIL TESTEMUNHA 1': z.string().email("E-mail da testemunha inválido").optional().or(z.literal('')),
  'CPF TESTEMUNHA 1': z.string().regex(cpfRegex, "CPF da testemunha inválido").optional().or(z.literal('')),
  'NOME TESTEMUNHA 2': z.string().min(3, "Nome da testemunha 2 muito curto").optional().or(z.literal('')),
  'EMAIL TESTEMUNHA 2': z.string().email("E-mail da testemunha 2 inválido").optional().or(z.literal('')),
  'CPF TESTEMUNHA 2': z.string().regex(cpfRegex, "CPF da testemunha 2 inválido").optional().or(z.literal('')),
  'NOME TESTEMUNHA 3': z.string().min(3, "Nome da testemunha 3 muito curto").optional().or(z.literal('')),
  'EMAIL TESTEMUNHA 3': z.string().email("E-mail da testemunha 3 inválido").optional().or(z.literal('')),
  'CPF TESTEMUNHA 3': z.string().regex(cpfRegex, "CPF da testemunha 3 inválido").optional().or(z.literal('')),
  'NOME TESTEMUNHA 4': z.string().min(3, "Nome da testemunha 4 muito curto").optional().or(z.literal('')),
  'EMAIL TESTEMUNHA 4': z.string().email("E-mail da testemunha 4 inválido").optional().or(z.literal('')),
  'CPF TESTEMUNHA 4': z.string().regex(cpfRegex, "CPF da testemunha 4 inválido").optional().or(z.literal('')),
  'NOME TESTEMUNHA 5': z.string().min(3, "Nome da testemunha 5 muito curto").optional().or(z.literal('')),
  'EMAIL TESTEMUNHA 5': z.string().email("E-mail da testemunha 5 inválido").optional().or(z.literal('')),
  'CPF TESTEMUNHA 5': z.string().regex(cpfRegex, "CPF da testemunha 5 inválido").optional().or(z.literal('')),
  'NOME TESTEMUNHA 6': z.string().min(3, "Nome da testemunha 6 muito curto").optional().or(z.literal('')),
  'EMAIL TESTEMUNHA 6': z.string().email("E-mail da testemunha 6 inválido").optional().or(z.literal('')),
  'CPF TESTEMUNHA 6': z.string().regex(cpfRegex, "CPF da testemunha 6 inválido").optional().or(z.literal('')),
  'NOME VENDEDOR': z.string().min(3, "Nome do vendedor obrigatório"),
  'EMAIL VENDEDOR': z.string().email("E-mail do vendedor obrigatório"),
  'CPF VENDEDOR': z.string().regex(cpfRegex, "CPF do vendedor inválido"),
  'NOME TESTEMUNHA FIXA 1': z.string().optional(),
  'EMAIL TESTEMUNHA FIXA 1': z.string().optional(),
  'CPF TESTEMUNHA FIXA 1': z.string().optional(),
  'NOME TESTEMUNHA FIXA 2': z.string().optional(),
  'EMAIL TESTEMUNHA FIXA 2': z.string().optional(),
  'CPF TESTEMUNHA FIXA 2': z.string().optional(),
  'NOME TESTEMUNHA FIXA 3': z.string().optional(),
  'EMAIL TESTEMUNHA FIXA 3': z.string().optional(),
  'CPF TESTEMUNHA FIXA 3': z.string().optional(),
  'PRAZO CONTRATUAL MESES': z.union([z.number(), z.string()]).optional().transform(val => val ? Number(val) : undefined).refine(val => val === undefined || val > 0, "Prazo deve ser maior que 0"),
  'TELEFONE FINANCEIRO CONTRATANTE': z.string().optional(),
  'EMAIL FINANCEIRO CONTRATANTE': z.string().email("E-mail inválido").optional().or(z.literal('')),
  'LINK INSTAGRAM CONTRATANTE': z.string().optional(),
  'QTD ARTES': z.string().optional(),
  'QTD VIDEOS': z.string().optional(),
  'ID DO DOCUMENTO CLICKSIGN': z.string().optional().or(z.literal('')),
  'isDebug': z.union([z.boolean(), z.string()]).optional(),
  'NOME SDR': z.string().optional().or(z.literal('')),
  'CPF SDR': z.string().regex(cpfRegex, "CPF do SDR inválido").optional().or(z.literal('')),
  'NOME COORD BU': z.string().optional().or(z.literal('')),
  'CPF COORD BU': z.string().regex(cpfRegex, "CPF do Coord inválido").optional().or(z.literal('')),
});

export const contractSubmissionSchema = z.object({
  data: contractDataSchema,
  bu_id: z.number({ required_error: "ID da BU é obrigatório" }),
  bu_name: z.string().optional(),
  sdr_id: z.union([z.string(), z.number()]).optional().nullable(),
}).superRefine((val, ctx) => {
  const isBomma = val.bu_name?.toUpperCase().includes('BOMMA');
  const instagram = val.data['LINK INSTAGRAM CONTRATANTE'];
  
  if (isBomma && (!instagram || instagram.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O link do Instagram é obrigatório para contratos Bomma",
      path: ['data', 'LINK INSTAGRAM CONTRATANTE'],
    });
  }
});
