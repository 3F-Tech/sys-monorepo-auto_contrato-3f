# 📑 Automação de Contratos - V1

Sistema monorepo para gestão de vendedores e automação de disparos de contratos. Este projeto utiliza uma arquitetura orientada a contexto para máxima eficiência com IA.

---

## 🧠 Guia de Contexto (Para IAs e Desenvolvedores)

Antes de codificar, consulte os arquivos mestre na raiz:
- [**GEMINI.md**](./GEMINI.md): Padrões de escrita, comportamento da IA e regras técnicas.
- [**ARCHITECTURE.md**](./ARCHITECTURE.md): Mapa de pastas, fluxo de dados e integrações.
- [**CONTEXT.md**](./CONTEXT.md): Regras de negócio, escopo da V1 e perfis de usuário.

> **Importante:** Cada View e Módulo possui seu próprio arquivo `rules.md` local. Sempre verifique-os antes de alterar arquivos específicos.

---

## 🛠️ Tecnologias Principais

### Core
- **Gerenciador:** PNPM Workspaces + Turborepo
- **Infra:** Supabase (Auth / Database / Storage)

### Apps
- **Frontend (`apps/web`):** Vue 3 (Composition API), Pinia, TailwindCSS.
- **Backend (`apps/api`):** Node.js (Express), Prisma ORM, Zod, Swagger.

### Ferramentas e Utilitários
- **Sync:** [Kubb](https://kubb.dev/) (Geração automática de hooks/types baseada no Swagger).
- **Icons:** Lucide-icons.

---

## 🚀 Como Executar

1. **Instalação:**
   ```bash
   pnpm install