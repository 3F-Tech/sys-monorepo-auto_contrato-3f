# Lógica de Competência do Dashboard (Regra 06 a 05)

Este documento explica o funcionamento da filtragem de dados e cálculo de métricas no dashboard do sistema, que segue uma lógica de competência financeira customizada.

## 1. O Filtro Principal: Data P1
Diferente de um dashboard comum que filtra por data de criação do registro, este sistema utiliza a **Data do Primeiro Pagamento (P1)** como o eixo temporal para **todas** as métricas exibidas.

### Fluxo de Prioridade:
Ao filtrar os contratos para um determinado período:
1.  O sistema verifica se o contrato possui o campo `Data do Primeiro Pagamento`.
2.  Caso possua, esta data é utilizada para determinar se o contrato entra no cálculo.
3.  Caso **não** possua (contratos antigos ou legados), o sistema utiliza a **Data de Criação** como fallback.

## 2. A Janela de 06 a 05
A competência de cada mês não termina no dia 30/31, mas sim no dia 05 do mês seguinte. 

### Exemplo de Seleção: **Julho**
Se um usuário selecionar o mês de **Julho** no filtro do dashboard, o sistema apresentará os dados de todos os contratos cujo primeiro pagamento ocorra na seguinte janela:
- **Início**: 06 de Julho às 00:00:00
- **Fim**: 05 de Agosto às 23:59:59

| Mês Selecionado | Data de Início (06) | Data de Fim (05 do mês seguinte) |
| :--- | :--- | :--- |
| Janeiro | 06/01 | 05/02 |
| Fevereiro | 06/02 | 05/03 |
| Março | 06/03 | 05/04 |
| ... | ... | ... |

## 3. Métricas Impactadas
Esta lógica de janela móvel é aplicada a **todos** os indicadores do dashboard:
- **Contratos Gerados**: Quantidade de contratos cuja competência (P1 ou Criação) cai na janela.
- **Total Implementação**: Soma das taxas de implementação dos contratos daquela janela.
- **Recorrência Mensal**: Soma dos valores mensais dos contratos daquela janela.
- **Média de Assinatura**: Tempo médio entre criação e assinatura dos contratos daquela janela.
- **Valor P1**: Soma dos valores de primeiro pagamento dos contratos daquela janela.
- **Valor Total (TCV)**: Valor total do contrato (Implementação + Mensalidade * Prazo Contratual).
- **NMRR**: Valor mensal normalizado (TCV / Prazo Contratual).
- **Taxa de Assinatura**: Percentual de contratos assinados dentro do montante daquela janela.

## 4. Obrigatoriedade de Assinatura
Para garantir que o dashboard apresente um cenário de **faturamento real**, as métricas principais do dashboard consideram exclusivamente os contratos que já foram **assinados** (`signed: true`).

Contratos que foram gerados mas ainda estão pendentes de assinatura:
- **Não** aparecem no somatório do resumo (Valor P1, Implementação, etc.).
- **Continuam visíveis** na seção de "Gerenciar Contratos" para acompanhamento e finalização do fluxo.

> **Exceção**: A métrica de **Taxa de Assinatura** ignora este filtro de obrigatoriedade, pois precisa comparar o volume de assinados com o total de gerados (pendentes + assinados) para calcular a eficácia de conversão.

## 5. Período Geral
Caso a opção **"Período Geral"** seja selecionada, o sistema remove as restrições de data e exibe o somatório total de todos os contratos vinculados ao usuário/equipe/BU, independente de quando o pagamento ocorra (desde que assinados).

---
*Nota: Esta lógica garante que o dashboard reflita exatamente o ciclo de faturamento e as metas comerciais da empresa.*

## 6. Visualização: ApexCharts
O dashboard utiliza a biblioteca **ApexCharts** (`vue3-apexcharts`) para renderizar os indicadores de NMRR e TCV. As cores dos gráficos devem seguir rigorosamente o Design System estabelecido no `.antigravityrules.md` (Ciano para métricas positivas, Azul para comparativos).
