# 🔵 API — Automação de Contratos

Backend da plataforma de automação de contratos, construído com **Node.js + Express + Prisma ORM**.

---

## 🛠️ Tecnologias e Dependências

| Tecnologia | Uso |
|---|---|
| **Node.js + Express** | Servidor HTTP e roteamento |
| **Prisma ORM** | Comunicação com o banco de dados PostgreSQL (Supabase) |
| **Zod** | Validação de payloads |
| **JWT** | Autenticação via token |
| **Swagger (JSDoc)** | Documentação da API em `swagger.json` |
| **Google Sheets API** | Persistência de contratos em planilhas externas |

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18
- PNPM instalado globalmente

### Instalação (a partir da raiz do monorepo)
```bash
pnpm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` dentro de `apps/api/` com as seguintes variáveis:

```env
# Banco de Dados (Supabase PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Autenticação JWT
JWT_SECRET="seu_segredo_jwt_aqui"

# Google Sheets (Credenciais da Service Account em JSON)
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

> ⚠️ **Nunca commite o `.env`**. Ele está no `.gitignore`.

### Executar em desenvolvimento
```bash
# A partir da raiz do monorepo:
pnpm --filter api dev

# Ou diretamente nesta pasta:
pnpm dev
```

A API estará disponível em: **`http://localhost:3007`**

---

## 📋 Endpoints Principais

### Autenticação (Auth)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/login` | Autenticação (retorna JWT) |

### Vendedores
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/sellers` | Listar vendedores (filtros: `head_id`, `type`) |
| `GET` | `/sellers/:id` | Buscar vendedor por ID |
| `GET` | `/sellers/email/:email` | Buscar vendedor por e-mail |
| `POST` | `/sellers` | Criar novo vendedor |
| `PUT` | `/sellers/:id` | Atualizar dados do vendedor |
| `DELETE` | `/sellers/:id` | Remover vendedor |

### Empresas (BUs)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/business` | Listar todas as empresas |
| `GET` | `/business/:id` | Buscar empresa por ID |
| `POST` | `/business` | Criar nova empresa |
| `PUT` | `/business/:id` | Atualizar empresa |
| `DELETE` | `/business/:id` | Remover empresa |

### Vínculos (Vendedor ↔ Empresa)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/seller-business` | Listar vínculos |
| `GET` | `/seller-business/:id` | Vínculos por empresa |
| `PUT` | `/seller-business` | Atualizar vínculos de um vendedor |

### Contratos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/contracts` | Listar todos os contratos |
| `GET` | `/contracts/seller/:sellerId` | Contratos de um vendedor |
| `GET` | `/contracts/head/:headId` | Contratos da equipe de um Head |
| `GET` | `/contracts/bu/:buId` | Contratos de uma BU |
| `POST` | `/contracts` | Registrar contrato no banco |
| `PUT` | `/contracts/:id` | Atualizar status do contrato |
| `DELETE` | `/contracts/:id` | Remover contrato |

### Submissão de Contratos (Google Sheets)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/contracts/submit/impulse-plano1` | Enviar Plano 1 - Impulse |
| `POST` | `/contracts/submit/impulse-plano2` | Enviar Plano 2 - Impulse |
| `POST` | `/contracts/submit/seed-plano1` | Enviar Plano 1 - Seed |
| `POST` | `/contracts/submit/seed-plano2` | Enviar Plano 2 - Seed |
| `POST` | `/contracts/submit/seed-growth` | Enviar Plano Growth - Seed |

### Verificação de Saúde (Health Check)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Status da API |

---

## 📖 Documentação da API

A documentação completa está disponível em `swagger.json` e é gerada a partir dos comentários JSDoc `@openapi` nos controllers.

Para visualizá-la, importe o `swagger.json` no [Swagger Editor](https://editor.swagger.io/).
