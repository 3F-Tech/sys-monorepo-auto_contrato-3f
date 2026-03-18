.
├── apps/
│   ├── api/                # Back-end Node.js
│   │   ├── prisma/         # Schema do Banco de Dados e Migrations
│   │   └── src/
│   │       ├── controllers/# Lógica de recebimento de requisições
│   │       └── routes/     # Definição de endpoints e Swagger Config
│   └── web/                # Front-end Vue 3
│       └── src/
│           ├── router/     # Configuração de rotas do VueRouter
│           ├── store/      # Estados globais (Pinia)
│           ├── views/      # Páginas (onde cada uma terá seu rules.md)
│           │   └── contracts/ # Fluxo de Automação de Contratos
│           │       ├── steps/   # Componentes de cada etapa do form
│           │       └── rule.md  # Regras para criação de novos forms
│           ├── App.vue     # Componente raiz
│           └── main.ts     # Entry point do Front
├── ops/                    # Configurações de deploy
│   └── project.yml         # Orquestrador de deploy (build/start cmd, pm2, nginx)
├── skills/               # Plugins de IA: Guia para criação de módulos complexos
│   ├── auto deploy/      # Skill de deploy e configuração de produção
│   └── contract-form/    # Skill para gerar novos formulários de contrato
├── packages/               # Configurações e pacotes compartilhados
├── kubb.config.ts          # Configuração de geração automática de contratos de API
├── dashboard-filters.md    # Documentação dos filtros do dashboard (mês/BU/vendedor)
├── .antigravityrules.md    # Regras globais (seu "cérebro" de desenvolvimento)
└── ARCHITECTURE.md         # Este guia

## 👥 Papéis (Roles) do Sistema
- **admin:** Poder total sobre usuários, unidades e configurações.
- **head:** Gestor de equipe. Pode supervisionar múltiplos vendedores e atuar em várias BUs.
- **coord:** Coordenador operacional. **Restrito a gerenciar uma única BU específica.**
- **vendedor:** Vendedor operacional. Pode estar vinculado a uma ou mais BUs para gerar contratos.