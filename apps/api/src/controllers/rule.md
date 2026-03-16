# Regras dos Controladores (Backend)

## 🎯 Responsabilidade
Os controladores em `apps/api/src/controllers` são responsáveis por orquestrar a lógica de requisição e resposta. Eles devem:
1. Validar a entrada de dados (Schema Validation).
2. Interagir com o banco de dados via Prisma.
3. Formatar e retornar a resposta adequada (incluindo tratamento de BigInt).
4. Gerenciar limites de payload (atualmente configurado para `10mb` para suportar logos em base64).

## 🔐 Autenticação e Segurança
- **MD5**: Toda validação de senha deve usar o algoritmo MD5 para compatibilidade com o legado.
- **JWT**: O endpoint de login deve emitir tokens JWT assinados com `JWT_SECRET` (definido no `.env`).
- **Payload**: Tokens devem conter `id`, `email` e `type`.
- **Expiração**: O token deve expirar em `3h`.
- **Proteção**: Todas as rotas (exceto `/login` e `/health`) devem utilizar o `authMiddleware`.

## 📝 Documentação (Swagger)
- **Obrigatoriedade**: Todo método público de um controlador DEVE possuir um bloco JSDoc `@openapi`.
- **Organização**: Use blocos JSDoc separados, colocados **imediatamente acima** de cada função. Nunca agrupe múltiplos métodos em um único bloco.
- **Componentes**: Utilize referências a schemas (ex: `$ref: '#/components/schemas/Sellers'`) sempre que possível.

## 📊 Integração Google Sheets & Banco de Dados
- **Persistência Dupla**: O `contractSheetsController.ts` é responsável por salvar os dados simultaneamente no Google Sheets e no banco de dados local via Prisma.
- **Planilhas**: O processamento de contratos é feito via abas dinâmicas.
- **Banco de Dados (Prisma)**:
  - **Título Padronizado**: `{{ Razão Social }} & {{ Nome da BU }} ({{ Plano }})`.
  - **Conversão**: Valores monetários e datas brasileiros devem ser convertidos para `Decimal` e `DateTime` antes da persistência.
- **Mapeamento de Colunas (Sheets)**:
  - Padrão (Plano 1/2): **25 colunas** (A até Y).
  - Growth: **24 colunas** (A até X), com remoção automática da coluna "Prazo Contratual".
- **Helper**: Use sempre o helper `handleContractSubmit` para novos contratos.

## ⚙️ Melhores Práticas
- **Tratamento de BigInt**: Sempre utilize o serializador JSON personalizado para converter BigInt em string antes de enviar a resposta.
- **Express Types**: Utilize a tipagem forte do Express (`Request`, `Response`) em todos os métodos.
- **Erros**: Retorne status codes apropriados (200/201 para sucesso, 400/401/404/500 para erros).
- **Log**: Em produção, evite `console.log` excessivo; utilize o padrão de logs do monorepo se disponível.

## 🔄 Evolução do Schema
- **Status de Mudança**: O campo `change_alert` (boolean) foi desativado em favor de `change_status` (string). Valores possíveis incluem `'alert'`, `'none'`, ou `null`.
