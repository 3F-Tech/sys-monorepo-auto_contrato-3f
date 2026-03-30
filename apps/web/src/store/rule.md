# Regras das Stores (Pinia)

## 🎯 Responsabilidade
Gerenciar o estado global da aplicação frontend, persistência de sessão e dados compartilhados entre componentes.

## 🛠️ Padrões de Implementação
1. **Paradigma**: Use exclusivamente a Syntax de **Setup Store** (funções `ref`, `computed` e `function`).
2. **Naming**: O nome do arquivo e da store deve ser descritivo (ex: `auth.ts` → `useAuthStore`).
3. **API Integration**: Utilize os hooks gerados pelo **Kubb** e o cliente **Axios** centralizado (`src/api/client.ts`).

## 📦 Stores Existentes

### `useAuthStore` (`auth.ts`)
Responsável pela sessão do usuário logado.
- **Estado**: `user` (objeto do vendedor logado), `token` (JWT).
- **Computed**: `isAuthenticated`, `userRole` (retorna `user.type`).
- **Ações**: `login(email, password)`, `logout()`, `updateUser(partial)`.

### `useContractStore` (`contracts.ts`)
Responsável pelos contratos visíveis ao usuário no dashboard.
- **Estado**: `myContracts` (lista de contratos), `loading`.
- **Ações**:
  - `fetchMyContracts(sellerId)` → Para `seller`.
  - `fetchTeamContracts(headId)` → Para `head`.
  - `fetchAllContracts()` → Para `admin` ou `coord`.
  - `updateContract(id, data)` → Atualiza `signed`, `signed_date`, `created_at`, `link`, `change_status`, `change_description`.

### `useSellerStore` (`seller.ts`)
Responsável pela listagem de vendedores para gestão da equipe.
- **Estado**: `teamSellers` (equipe do head), `allSellers` (todos os sellers), `loading`.
- **Ações**:
  - `fetchTeamSellers(headId)` → Busca por `head_id`.
  - `fetchAllSellers()` → Busca todos com `type === 'seller'`.
  - `updateSeller(id, data)` → Atualiza dados de um vendedor.

## 🔄 Qual Store/Método Usar por Cargo

| Cargo | Contratos | Vendedores |
|---|---|---|
| `seller` | `fetchMyContracts(user.id)` | N/A |
| `head` | `fetchTeamContracts(user.id)` | `fetchTeamSellers(user.id)` |
| `coord` | `fetchAllContracts()` | `fetchAllSellers()` (filtrado por BU) |
| `admin` | `fetchAllContracts()` | `fetchAllSellers()` |

## 🔐 Sessão e Persistência
- **LocalStorage**: `user` e `token` persistidos sob as chaves correspondentes.
- **Reatividade**: Use `computed` para estados derivados.
- **Axios Interceptor**: O token é injetado automaticamente via `src/api/client.ts` no header `Authorization: Bearer <token>`. O interceptor de resposta gerencia logout automático em caso de 401.

## ⚙️ Fluxo de Dados
- **Ações**: Funções assíncronas devem tratar erros (try/catch) e retornar `{ success: boolean, error?: string }`.
- **Hooks**: As stores são a ponte entre os hooks brutos do Kubb e os componentes da UI.

## 📝 Manutenção
Ao criar uma nova store, adicione-a aqui e referencie-a no `GEMINI.md`.
