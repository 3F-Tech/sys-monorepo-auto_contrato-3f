# Regras de Roteamento (Vue Router)

## 🎯 Responsabilidade
Definir a navegação da aplicação, proteção de rotas e controle de acesso baseado em cargos.

## 🗺️ Rotas Existentes

| Nome | Caminho | Componente | Meta |
|---|---|---|---|
| `home` | `/` | `Home.vue` | — (requer autenticação) |
| `login` | `/login` | `LoginView.vue` | `public: true` |
| `admin-users` | `/admin/users` | `UsersView.vue` | `adminOnly: true` |
| `admin-business` | `/admin/business` | `BusinessView.vue` | `adminOnly: true` |
| `new-contract` | `/contratos/novo` | `ContractFlow.vue` | — (requer autenticação) |

## 🛠️ Padrões de Implementação
1. **Navigation Guards**: Use `router.beforeEach` para verificar a autenticação antes de cada transição.
2. **Metas de Rota**:
   - `public: true` → Rota acessível sem autenticação (ex: `/login`). Se o usuário já estiver logado, é redirecionado para `/`.
   - `adminOnly: true` → Rota que exige `userRole === 'admin'`. Outros cargos são redirecionados para `/`.
   - Sem meta → Rota protegida por padrão. Requer autenticação.
3. **Controle de Acesso (RBAC)**:
   - A verificação de cargo é feita via `authStore.userRole`.

## 🧩 Configuração
- O arquivo principal de configuração é `src/router/index.ts`.
- Mantenha os nomes das rotas em kebab-case (ex: `admin-users`, `new-contract`).

## 📝 Manutenção
Ao criar uma nova rota, adicione-a à tabela acima.
