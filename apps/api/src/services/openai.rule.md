# Regras Locais: OpenAI Service

## Responsabilidade
Comunicação com a API da OpenAI (GPT) para geração de cláusulas jurídicas de negociação de contratos.

## Configuração
- **Variável de ambiente:** `API_KEY_GPT` no `.env` do backend
- **Modelo:** `gpt-4o-mini` (pode ser iterado)
- **Formato de resposta:** JSON (`response_format: { type: 'json_object' }`)

## Formato de Saída da IA
A IA retorna um JSON com:
- `text`: texto completo dos itens variáveis da cláusula (4.1, 4.2, ...)
- `num_items`: quantidade de itens gerados

## Convenção de Placeholders
- `{{nome_variavel}}` — minúsculo, underline, português
- `valor_*` = monetário, `data_*` = data, `dia_*` = número

## Rotas
- `POST /negotiation-templates/generate` — recebe `{ description: string }`, retorna `{ text, numItems }`

## Cálculo de Métricas (calculateContractMetrics)
- **Modelo:** `gpt-4o` (temperature 0 para máximo determinismo)
- **Chamado em:** `contractAutomationController.ts` → `handleContractSubmit`, **aguardado** antes de finalizar (loader fica em 85%)
- **Entrada:** cláusula renderizada (com valores preenchidos) + implementation_fee + contractual_term + first_payment_amount + monthly_fee
- **Saída:** `{ p1, tcv }` — 2 números com 2 casas decimais (NMRR removido — calculado pelo frontend)
- **Validação:** parseia resposta JSON, verifica que os 2 valores são números válidos. Se falhar, retenta 1 vez.
- **Persistência:** salva `first_payment_amount` e `tcv` no contrato via `prisma.contracts.update`
- **P1 retornado pela IA é o valor da primeira parcela SEM taxa de implementação** — o dashboard soma `implementation_fee` quando necessário
- **Execução síncrona** — aguarda cálculo antes de emitir progress 100%. Se falhar, o contrato é criado sem métricas.
- **Regras do prompt IA:**
  - A cláusula é a **fonte da verdade** (campos numéricos são auxiliares)
  - Suporta contratos à vista (pagamento único + impl)
  - Contagem de meses: `último_mês − primeiro_mês + 1` (regra anti off-by-one)
  - implementation_fee é **obrigatório** no TCV (breakdown deve terminar com "+ impl X = TCV")

## Fluxo de Persistência de Valores no Contrato
- **`monthly_fee`**: sempre `0` para contratos novos. Coluna mantida para contratos legados.
- **`implementation_fee`**: salvo por código, do campo fixo `VALOR TAXA IMPLEMENTACAO` (sempre presente)
- **`first_payment_amount`**: valor inicial salvo por código (fallback: `VALOR DO PRIMEIRO PAGAMENTO` → `VALOR MENSALIDADE` → `0`), depois **sobrescrito pela IA** com o P1 correto extraído da cláusula
- **`first_payment_date`**: salvo por código, do campo `DATA PRIMEIRO PAGAMENTO` (sincronizado via placeholder `data_primeiro_pagamento`)
- **`tcv`**: calculado e salvo pela IA (aguardado antes de finalizar o contrato)
- **`nmrr`**: coluna **removida** do banco — sempre calculado pelo frontend como `TCV / contractual_term`
- **`contractual_term`**: sempre do campo `PRAZO CONTRATUAL MESES` do formulário (sem override para Growth)
- **`negotiation_template_id`** e **`negotiation_clause`**: salvos no create para rastreabilidade

## Referência
- Feature completa: `.claude/NEGOTIATION_FEATURE.md`
- Controller templates: `apps/api/src/controllers/negotiationTemplateController.ts`
- Controller contratos: `apps/api/src/controllers/contractAutomationController.ts`
