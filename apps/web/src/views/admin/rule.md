# Regras das Views de Admin

## 🎯 Responsabilidade
Essas views em `src/views/admin` são exclusivas para o cargo `admin`. Elas permitem a gestão completa de Usuários e Unidades de Negócio.

## 🛠️ Padrões de Implementação
1. **Componentização**: A lógica de formulários deve residir em modais dentro de `src/components/admin`.
2. **Proteção**: Estas páginas dependem do cargo `admin` na `authStore`. O roteamento deve bloquear o acesso de outros cargos.
3. **Feedback**: Operações de criação, edição e exclusão devem fornecer feedback visual (ex: loaders, mensagens de sucesso/erro em português).

## 🧩 Fluxo de Dados
- **UsersView**: Lista todos os vendedores. Permite abrir o `UserModal` para CRUD.
- **BusinessView**: Lista todas as empresas. Permite abrir o `BusinessModal` para CRUD.
- **Hooks**: Utilize `getSellers`, `getBusiness`, `postSellers`, `postBusiness`, `putSellers`, `putBusiness`, `deleteSellers`, `deleteBusiness`.

## 🎨 Design
- Siga o padrão de tabelas/cards com design dark e detalhes em ciano (`brand-cyan`).
- Mantenha a consistência com a `Home.vue`.
