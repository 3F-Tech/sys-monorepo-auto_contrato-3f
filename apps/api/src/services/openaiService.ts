import OpenAI from 'openai';

let _openai: OpenAI | null = null;
const getOpenAI = () => {
    if (!_openai) {
        _openai = new OpenAI({ apiKey: process.env.API_KEY_GPT });
    }
    return _openai;
};

export const OpenAIService = {
    async generateNegotiationClause(description: string): Promise<{ text: string; numItems: number }> {
        const systemPrompt = `Você é um redator jurídico especializado em contratos comerciais B2B de agências de marketing digital brasileiras.

## Sua Tarefa
Receber a descrição de uma negociação comercial em linguagem informal e transformá-la na parte variável da Cláusula 4 (Remuneração) de um contrato formal.

## Regras de Formato
1. Numere cada item a partir de 4.1, 4.2, 4.3, etc.
2. Use linguagem jurídica formal brasileira (tom contratual, referências a CONTRATANTE e CONTRATADA).
3. Insira placeholders no formato {{nome_variavel}} onde houver valores que mudam por contrato.
4. Convenção de placeholders: tudo minúsculo, palavras separadas por underline, em português. Exemplos: {{valor_mensalidade}}, {{data_primeiro_pagamento}}, {{dia_vencimento_mensal}}, {{valor_taxa_implementacao}}.
5. Gere SOMENTE os itens variáveis da negociação. NÃO inclua cláusulas sobre emissão de nota fiscal, tributos, atraso de pagamento ou pontualidade — esses itens são fixos e já existem no contrato.
6. Use subitens com letras (a), (b), (c) quando precisar listar componentes dentro de um mesmo item (ex: composição da remuneração).
7. Responda EXCLUSIVAMENTE com um JSON válido, sem markdown, sem backticks, sem texto antes ou depois.
8. NUNCA use linguagem interna ou comercial no texto (ex: "vendedor", "coordenador", "negociação entre as partes", "conforme escolha do vendedor"). O texto é um contrato formal — as únicas partes são CONTRATANTE e CONTRATADA.
9. NUNCA inclua condicionais sobre valores dos placeholders (ex: "poderá ser isenta", "caso aplicável", "se houver"). Se um valor pode ser zero, o placeholder já resolve — o vendedor preencherá R$ 0,00. O texto deve ser sempre afirmativo e direto.
10.Quando o dia de vencimento for o mesmo para todas as parcelas, NÃO repita a informação de vencimento em itens separados para cada faixa. Consolide em um único item genérico (ex: "Todas as parcelas previstas nesta cláusula terão vencimento fixo no dia {{dia_vencimento_mensal}} de cada mês"). Crie itens separados de vencimento APENAS se houver datas ou dias diferentes entre as faixas.

## Formato de Resposta (JSON)
{
  "text": "texto completo dos itens com quebras de linha (\\n) entre eles",
  "num_items": 3
}

## Exemplos

### Exemplo 1 — Entrada do usuário:
"Fee mensal padrão: cliente paga taxa de implementação junto com a primeira mensalidade, depois parcelas fixas todo mês"

### Saída esperada:
{
  "text": "4.1. A remuneração devida pela CONTRATANTE à CONTRATADA será composta da seguinte forma:\\n(a) Taxa de Implementação: {{valor_taxa_implementacao}}, a ser paga juntamente com a primeira mensalidade;\\n(b) Mensalidade: {{valor_mensalidade}} por mês, durante a vigência contratual.\\n\\n4.2. O primeiro pagamento deverá ser efetuado até o dia {{data_primeiro_pagamento}}, contemplando a taxa de implementação e a primeira mensalidade.\\n\\n4.3. As demais parcelas mensais, no valor de {{valor_mensalidade}} cada, terão vencimento fixo no dia {{dia_vencimento_mensal}} de cada mês, durante a vigência contratual.",
  "num_items": 3
}

### Exemplo 2 — Entrada do usuário:
"Entrada maior no primeiro mês, depois parcelas menores. A implementação vai junto da entrada"

### Saída esperada:
{
  "text": "4.1. A remuneração devida pela CONTRATANTE à CONTRATADA será composta da seguinte forma:\\n(a) Taxa de Implementação: {{valor_taxa_implementacao}}, incluída no primeiro pagamento;\\n(b) Entrada: {{valor_entrada}}, a ser paga como primeiro pagamento, já incluindo a taxa de implementação;\\n(c) Parcelas subsequentes: {{valor_parcela_subsequente}} por mês, durante o restante da vigência contratual.\\n\\n4.2. O primeiro pagamento, no valor de {{valor_entrada}}, deverá ser efetuado até o dia {{data_primeiro_pagamento}}.\\n\\n4.3. As demais parcelas mensais, no valor de {{valor_parcela_subsequente}} cada, terão vencimento fixo no dia {{dia_vencimento_mensal}} de cada mês subsequente ao primeiro pagamento.",
  "num_items": 3
}

### Exemplo 3 — Entrada do usuário:
"Parcelas escalonadas: primeiros 3 meses valor menor, depois sobe pro valor cheio. Implementação separada junto do primeiro pagamento"

### Saída esperada:
{
  "text": "4.1. A remuneração devida pela CONTRATANTE à CONTRATADA será composta da seguinte forma:\\n(a) Taxa de Implementação: {{valor_taxa_implementacao}}, a ser paga juntamente com o primeiro pagamento;\\n(b) Parcelas iniciais: {{valor_parcela_inicial}} por mês, durante os primeiros {{qtd_meses_iniciais}} meses de vigência;\\n(c) Parcelas regulares: {{valor_mensalidade}} por mês, a partir do mês subsequente ao término do período inicial, até o encerramento da vigência contratual.\\n\\n4.2. O primeiro pagamento deverá ser efetuado até o dia {{data_primeiro_pagamento}}, contemplando a taxa de implementação e a primeira parcela inicial.\\n\\n4.3. Todas as parcelas previstas nesta cláusula terão vencimento fixo no dia {{dia_vencimento_mensal}} de cada mês, durante a vigência contratual.",
  "num_items": 3
}

## Importante
- Se a descrição do usuário for vaga, faça inferências razoáveis para manter a cláusula completa e juridicamente consistente.
- Reutilize o mesmo placeholder quando o valor se repetir (ex: {{valor_mensalidade}} aparece no item da composição e no item do vencimento).
- NUNCA gere itens sobre nota fiscal, tributos, suspensão por atraso ou pontualidade de pagamento.
- O texto deve fluir como uma cláusula contratual real — coeso, sem redundâncias, mas cobrindo todas as condições de pagamento descritas.`;

        const response = await getOpenAI().chat.completions.create({
            model: 'gpt-4o',
            temperature: 0.2,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: description },
            ],
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Resposta vazia da IA');
        }

        const parsed = JSON.parse(content);
        return {
            text: parsed.text,
            numItems: parsed.num_items,
        };
    },

    /**
     * Calcula P1, TCV e NMRR de um contrato a partir da cláusula renderizada e dados financeiros.
     * Usa gpt-4o-mini com temperature 0 para máxima determinismo.
     * Inclui 1 retry automático em caso de resposta inválida.
     */
    async calculateContractMetrics(params: {
        renderedClause: string;
        implementationFee: number;
        contractualTerm: number | null;
        firstPaymentAmount: number | null;
        monthlyFee: number | null;
    }): Promise<{ p1: number; tcv: number }> {
        const systemPrompt = `Você é uma calculadora financeira de contratos. Sua ÚNICA função é calcular 2 métricas a partir dos dados de um contrato comercial.

## REGRA SUPREMA — A CLÁUSULA É A FONTE DA VERDADE
Os campos numéricos (first_payment_amount, monthly_fee) são AUXILIARES e podem estar zerados ou incompletos.
A **Cláusula de Remuneração** contém os valores REAIS do contrato. SEMPRE extraia os valores monetários (R$ X.XXX,XX) da cláusula.
Se a cláusula menciona um valor e o campo numérico está zerado, USE O VALOR DA CLÁUSULA.

## Definições (NUNCA desvie destas regras)

### P1 (Valor do Primeiro Pagamento — SEM taxa de implementação)
É o valor que o cliente paga no primeiro pagamento, SEM incluir a taxa de implementação.
- Leia a cláusula e identifique o valor do primeiro pagamento (entrada, primeira parcela, mensalidade, pagamento único/à vista)
- Para contratos À VISTA ou PAGAMENTO ÚNICO: P1 = o valor total pago pelo cliente (sem implementação)
- Se houver um valor de entrada/primeira parcela diferente da mensalidade regular, use esse valor
- Se todas as parcelas forem iguais (mensalidade padrão), use o valor da mensalidade
- Se o primeiro pagamento acumula mais de uma parcela (ex: "primeira e segunda parcelas pagas juntas"), some APENAS essas parcelas
- NÃO some implementation_fee ao P1 — retorne APENAS o valor da(s) parcela(s) ou pagamento único

### TCV (Total Contract Value)
É a soma de TODOS os pagamentos REAIS que o cliente efetivamente fará durante todo o contrato.

**MÉTODO OBRIGATÓRIO — siga passo a passo:**
1. Leia a cláusula e identifique a estrutura de pagamento
2. Para contratos À VISTA / PAGAMENTO ÚNICO: TCV = valor pago + implementation_fee
3. Para contratos RECORRENTES: liste CADA mês (1 até prazo_contratual_meses), determine o valor por mês, e some tudo
4. Se um mês é isento/gratuito, o valor desse mês é R$ 0,00
5. **SEMPRE some implementation_fee uma única vez ao total final**

**Regras críticas:**
- Mês isento = R$ 0,00. NÃO conte como se fosse pago.
- Se a cláusula diz "terceira parcela isenta", o mês 3 vale R$ 0,00
- Se parcelas são pagas cumulativamente no primeiro pagamento (ex: "primeira e segunda parcelas no primeiro pagamento"), elas contam como 2 meses pagos, NÃO como 1 pagamento único de valor maior
- implementation_fee é um valor SEPARADO — **OBRIGATÓRIO somar uma única vez ao total**. TCV sem implementation_fee está ERRADO.
- Se first_payment_amount e monthly_fee estão ZERADOS mas a cláusula menciona valores em R$, EXTRAIA esses valores da cláusula
- **CONTAGEM DE MESES**: "meses 4 a 12" = 9 meses (12 − 4 + 1 = 9, NÃO 12 − 4 = 8). SEMPRE use último_mês − primeiro_mês + 1.

## Exemplos de cálculo

### Exemplo 1 — Contrato recorrente com isenção
Cláusula: "Parcelas 1 e 2: R$ 1.200 cada (pagas juntas no 1º pagamento). Parcela 3: isenta. Parcelas 4 a 12: R$ 1.200/mês."
implementation_fee = 1500, prazo = 12 meses

Cálculo: Mês 1: 1.200 | Mês 2: 1.200 | Mês 3: 0 (isento) | Meses 4-12: 1.200 × 9 meses (12−4+1=9) = 10.800
Subtotal parcelas: 13.200 | + impl 1.500 = 14.700
→ P1 = 2.400 | TCV = 14.700

### Exemplo 2 — Contrato à vista
Cláusula: "A remuneração será paga em parcela única no valor de R$ 20.000,00."
implementation_fee = 1000

Cálculo: Pagamento único: 20.000 | + impl 1.000 = 21.000
→ P1 = 20.000 | TCV = 21.000

## Regras de cálculo
- Todos os valores monetários estão em formato brasileiro: "1.500,00" = mil e quinhentos
- Para converter: remova pontos, troque vírgula por ponto → parseFloat
- Arredonde todos os resultados para 2 casas decimais
- NUNCA invente valores — use APENAS os dados fornecidos (cláusula + campos numéricos)
- Se a cláusula e os campos numéricos divergem, PRIORIZE A CLÁUSULA

## Formato de resposta
Responda EXCLUSIVAMENTE com JSON válido, sem markdown, sem backticks.
Inclua o campo "breakdown" com o raciocínio ANTES dos totais — isso força você a pensar antes de somar. O breakdown DEVE terminar com "+ impl X = TCV final" para garantir que a implementação foi incluída.

{"breakdown": "Pagamento único: 20000 | + impl 1000 = 21000", "p1": 20000.00, "tcv": 21000.00}`;

        const userMessage = `## Dados do Contrato

implementation_fee: ${params.implementationFee ?? 0}
first_payment_amount: ${params.firstPaymentAmount ?? 0}
monthly_fee: ${params.monthlyFee ?? 0}
prazo_contratual_meses: ${params.contractualTerm ?? 0}

## Cláusula de Remuneração (valores já preenchidos)
${params.renderedClause}

Calcule P1 e TCV.`;

        const tryCalculate = async (): Promise<{ p1: number; tcv: number }> => {
            const response = await getOpenAI().chat.completions.create({
                model: 'gpt-4o',
                temperature: 0,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;
            if (!content) throw new Error('Resposta vazia da IA');

            const parsed = JSON.parse(content);

            if (parsed.breakdown) {
                console.log(`[METRICS] Raciocínio da IA: ${parsed.breakdown}`);
            }

            const p1 = parseFloat(parsed.p1);
            const tcv = parseFloat(parsed.tcv);

            if (isNaN(p1) || isNaN(tcv)) {
                throw new Error(`Valores inválidos retornados: p1=${parsed.p1}, tcv=${parsed.tcv}`);
            }

            return {
                p1: Math.round(p1 * 100) / 100,
                tcv: Math.round(tcv * 100) / 100,
            };
        };

        // Tenta calcular, com 1 retry em caso de falha
        try {
            return await tryCalculate();
        } catch (firstError: any) {
            console.warn('[METRICS] Primeira tentativa falhou, retentando...', firstError.message);
            return await tryCalculate();
        }
    },
};
