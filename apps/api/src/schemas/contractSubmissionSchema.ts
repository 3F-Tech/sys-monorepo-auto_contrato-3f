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
  'BAIRRO DO CONTRATANTE': z.string().min(1, "Bairro obrigatório"),
  'CIDADE DO CONTRATANTE': z.string().min(1, "Cidade obrigatória"),
  'UF DO CONTRATANTE': z.string().transform(v => v.trim().toUpperCase()),
  'NOME DO REPRESENTANTE': z.string().min(2, "Nome do representante obrigatório"),
  'CARGO DO REPRESENTANTE': z.string().min(1, "Cargo obrigatório"),
  'CPF DO REPRESENTANTE': z.string().transform(v => v.trim()),
  'VALOR TAXA IMPLEMENTACAO': z.string().min(1, "Taxa de implementação obrigatória"),
  'VALOR MENSALIDADE': z.string().min(1, "Valor da mensalidade obrigatório"),
  'DATA PRIMEIRO PAGAMENTO': z.string().min(1, "Data de pagamento obrigatória"),
  'DIA VENCIMENTO MENSAL': z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val >= 1 && val <= 31, "Dia de vencimento deve ser entre 1 e 31"),
  'DATA ASSINATURA CONTRATO': z.string().min(1, "Data de assinatura obrigatória"),
  'NOME TESTEMUNHA 1': z.string().min(2, "Nome da testemunha obrigatório"),
  'CPF TESTEMUNHA 1': z.string().transform(v => v.trim()),
  'NOME VENDEDOR': z.string().min(2, "Nome do vendedor obrigatório"),
  'CPF VENDEDOR': z.string().transform(v => v.trim()),
  'NOME COORD BU': z.string().min(2, "Nome do coordenador obrigatório"),
  'CPF COORD BU': z.string().transform(v => v.trim()),
  'PRAZO CONTRATUAL MESES': z.union([z.number(), z.string()]).optional().transform(val => val ? Number(val) : undefined).refine(val => val === undefined || val > 0, "Prazo deve ser maior que 0"),
  'TELEFONE FINANCEIRO CONTRATANTE': z.string().optional(),
  'EMAIL FINANCEIRO CONTRATANTE': z.string().email("E-mail inválido").optional().or(z.literal('')),
  'LINK INSTAGRAM CONTRATANTE': z.string().optional(),
  'QTD ARTES': z.string().optional(),
  'QTD VIDEOS': z.string().optional(),
});

export const contractSubmissionSchema = z.object({
  data: contractDataSchema,
  bu_id: z.number({ required_error: "ID da BU é obrigatório" }),
  bu_name: z.string().optional(),
});
