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
- **RBAC (Controle de Acesso em Sellers)**:
  - `admin`: Ver e gerenciar todos os usuários e BUs.
  - `head`: Vê apenas sua equipe direta (`head_id`). Só pode criar/editar vendedores para sua própria equipe. Não pode mudar o próprio cargo de um alvo.
  - `coord`: Vê todos os usuários vinculados à sua BU. Pode criar qualquer cargo, facilitando a gestão descentralizada da unidade. Não pode gerenciar BUs.
  - `vendedor`: Acesso apenas aos próprios dados.

## 📝 Documentação (Swagger)
- **Obrigatoriedade**: Todo método público de um controlador DEVE possuir um bloco JSDoc `@openapi`.
- **Organização**: Use blocos JSDoc separados, colocados **imediatamente acima** de cada função. Nunca agrupe múltiplos métodos em um único bloco.
- **Componentes**: Utilize referências a schemas (ex: `$ref: '#/components/schemas/Sellers'`) sempre que possível.

## 📊 Automação Google Docs & Banco de Dados
- **Persistência Local**: O `contractAutomationController.ts` é responsável por salvar os dados no banco de dados local via Prisma.
- **Automação de Documentos**: O processamento de contratos gera uma cópia de um modelo no Google Docs e preenche as variáveis dinamicamente.
- **Banco de Dados (Prisma)**:
  - **Título Padronizado**: `{{ Razão Social }} & {{ Nome da BU }} ({{ Plano }})`. 
  - **Exceção BOMMA**: Contratos da BU Bomma seguem a nomenclatura: `{{ Razão Social }} & BOMMA ASSESSORIA DE MARKETING LTDA - {{ NOME FORMAL DO CONTRATO }}`.
  - **Conversão**: Valores monetários e datas brasileiros devem ser convertidos para `Decimal` e `DateTime` antes da persistência.
- **Clicksign Integration**: O backend deve ser capaz de exportar o Doc gerado para PDF (via Drive API) e enviar para o Clicksign via `ClickSignService.ts`.
- **Formatação p/ Google Docs**:
  - **Moeda**: Adicione sempre "R$ " antes de valores monetários.
  - **Instagram**: Adicione sempre "@" antes de handles de redes sociais.
- **Helper**: Use sempre o helper `handleContractSubmit` para novos contratos.

## ⚙️ Melhores Práticas
- **Tratamento de BigInt**: Sempre utilize o serializador JSON personalizado para converter BigInt em string antes de enviar a resposta.
- **Express Types**: Utilize a tipagem forte do Express (`Request`, `Response`) em todos os métodos.
- **Erros**: Retorne status codes apropriados (200/201 para sucesso, 400/401/404/500 para erros).
- **Log**: Em produção, evite `console.log` excessivo; utilize o padrão de logs do monorepo se disponível.

## 🔄 Evolução do Schema
- **Status de Mudança**: O campo `change_alert` (boolean) foi desativado em favor de `change_status` (string). Valores possíveis: `'alert'`, `'approved'`, `'reject'`, ou `null` (padrão). Não use o valor `'none'`.

## 🛠️ Build e Configuração TypeScript
- **Módulo**: A API compila com `"module": "Node16"` e `"moduleResolution": "Node16"` no `tsconfig.json`, gerando output **CommonJS**.
- **Output**: O build `tsc` gera os arquivos em `dist/src/` (não `dist/` diretamente), pois `rootDir` é `.` (raiz de `apps/api`).
- **Comando de start em produção**: `node apps/api/dist/src/index.js` (configurado em `ops/project.yml`).
- **Proibido**: Não use `import.meta.url` — incompível com output CommonJS. Use `__dirname` diretamente.
- **Imports**: Nunca adicione extensão `.ts` em imports relativos dentro do código-fonte.
