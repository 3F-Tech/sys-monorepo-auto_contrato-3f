export const validateCNPJ = (cnpj: string) => {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 11 && digits.length !== 14) {
    return "O documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos";
  }
  return null;
};

export const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return "O CPF deve ter 11 dígitos";
  return null;
};

export const validateCEP = (cep: string) => {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return "O CEP deve ter 8 dígitos";
  return null;
};

export const validateDate = (date: string) => {
  if (!date) return "Data é obrigatória";
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(date)) return "Formato inválido (DD/MM/AAAA)";
  
  const [day, month, year] = date.split('/').map(Number);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return "Data inexistente";
  }
  return null;
};

export const validateRequired = (val: any, fieldName: string) => {
  if (val === undefined || val === null || val === '') return `${fieldName} é obrigatório`;
  return null;
};

export const getValidationRules = (data: Record<string, any>, buName?: string, templateName?: string) => {
  const errors: Record<string, string> = {};

  const check = (key: string, error: string | null) => {
    if (error) errors[key] = error;
  };

  const isBomma = buName?.toUpperCase().includes('BOMMA');
  const tName = templateName?.toUpperCase() || '';

  // Instagram obrigatório apenas para Bomma
  if (isBomma) {
    check('LINK INSTAGRAM CONTRATANTE', validateRequired(data['LINK INSTAGRAM CONTRATANTE'], 'Link do Instagram'));
  }

  // Regras de Social Media para Bomma (QTD ARTES / QTD VIDEOS)
  if (isBomma) {
    const needsArtes = tName.includes('ARTES') || tName.includes('DETERMINADA');
    const needsVideos = tName.includes('VÍDEOS') || tName.includes('VIDEOS') || tName.includes('DETERMINADA');

    if (needsArtes) {
      check('QTD ARTES', validateRequired(data['QTD ARTES'], 'Quantidade de artes'));
    }
    if (needsVideos) {
      check('QTD VIDEOS', validateRequired(data['QTD VIDEOS'], 'Quantidade de vídeos'));
    }
  }

  check('RAZAO SOCIAL DO CONTRATANTE', validateRequired(data['RAZAO SOCIAL DO CONTRATANTE'], 'Razão Social'));
  check('CNPJ DO CONTRATANTE', validateCNPJ(data['CNPJ DO CONTRATANTE'] || ''));
  check('CEP DO CONTRATANTE', validateCEP(data['CEP DO CONTRATANTE'] || ''));
  check('LOGRADOURO DO CONTRATANTE', validateRequired(data['LOGRADOURO DO CONTRATANTE'], 'Logradouro'));
  check('NUMERO DO CONTRATANTE', validateRequired(data['NUMERO DO CONTRATANTE'], 'Número'));
  check('BAIRRO DO CONTRATANTE', validateRequired(data['BAIRRO DO CONTRATANTE'], 'Bairro'));
  check('CIDADE DO CONTRATANTE', validateRequired(data['CIDADE DO CONTRATANTE'], 'Cidade'));
  check('UF DO CONTRATANTE', data['UF DO CONTRATANTE']?.length !== 2 ? "UF inválida" : null);
  
  check('NOME DO REPRESENTANTE', validateRequired(data['NOME DO REPRESENTANTE'], 'Nome do representante'));
  check('EMAIL DO REPRESENTANTE', validateRequired(data['EMAIL DO REPRESENTANTE'], 'E-mail do representante'));
  check('CPF DO REPRESENTANTE', validateCPF(data['CPF DO REPRESENTANTE'] || ''));
  
  check('VALOR TAXA IMPLEMENTACAO', validateRequired(data['VALOR TAXA IMPLEMENTACAO'], 'Taxa de implementação'));
  check('VALOR MENSALIDADE', validateRequired(data['VALOR MENSALIDADE'], 'Mensalidade'));

  // VALOR DO PRIMEIRO PAGAMENTO só é obrigatório em contratos que tenham esse campo (Seed/Impulse)
  // A Bomma não possui esse campo no formulário
  if (!isBomma) {
    check('VALOR DO PRIMEIRO PAGAMENTO', validateRequired(data['VALOR DO PRIMEIRO PAGAMENTO'], 'Valor do primeiro pagamento'));
  }
  
  check('DATA PRIMEIRO PAGAMENTO', validateDate(data['DATA PRIMEIRO PAGAMENTO'] || ''));
  
  const diaVenc = Number(data['DIA VENCIMENTO MENSAL']);
  if (isNaN(diaVenc) || diaVenc < 1 || diaVenc > 31) {
    errors['DIA VENCIMENTO MENSAL'] = "Vencimento deve ser entre 1 e 31";
  }

  check('DATA ASSINATURA CONTRATO', validateDate(data['DATA ASSINATURA CONTRATO'] || ''));
  
  if (data['NOME TESTEMUNHA 1']) {
    check('NOME TESTEMUNHA 1', validateRequired(data['NOME TESTEMUNHA 1'], 'Nome da testemunha'));
    check('CPF TESTEMUNHA 1', validateCPF(data['CPF TESTEMUNHA 1'] || ''));
  }
  
  check('NOME VENDEDOR', validateRequired(data['NOME VENDEDOR'], 'Nome do vendedor'));
  check('CPF VENDEDOR', validateCPF(data['CPF VENDEDOR'] || ''));

  if (data['NOME SDR']) {
    check('CPF SDR', validateCPF(data['CPF SDR'] || ''));
  }

  if (data['PRAZO CONTRATUAL MESES'] !== undefined) {
    const prazo = Number(data['PRAZO CONTRATUAL MESES']);
    if (isNaN(prazo) || prazo <= 0) {
      errors['PRAZO CONTRATUAL MESES'] = "Prazo deve ser maior que 0";
    }
  }

  return errors;
};
