# Regras do Cliente API (Axios)

## 🎯 Responsabilidade
Configuração da base de comunicação com o backend e gerenciamento de interceptores.

## 🛠️ Padrões de Implementação
1. **Instância Central**: Utilize **sempre** a única instância do Axios exportada de `src/api/client.ts`. Nunca crie instâncias avulsas.
2. **Configuração Atual**:
   - **`baseURL`**: `http://localhost:3007` (desenvolvimento). Em produção, deve ser configurada via variável de ambiente `VITE_API_URL`.
   - **Header padrão**: `Content-Type: application/json`.
3. **Interceptors**:
   - **Request Interceptor**: Captura o `token` do `localStorage` e injeta o header `Authorization: Bearer <token>` automaticamente em cada requisição.
   - **Response Interceptor**: Trata erros globais `401` (não autorizado ou token expirado), limpando o `localStorage` e redirecionando para `/login`.
4. **Integração com Kubb**: Os hooks gerados em `src/gen` recebem esta instância como argumento `{ client }`.

## ⚙️ Configuração
- Para adicionar um novo header global ou timeout, edite `src/api/client.ts`.
- Não altere o comportamento dos interceptores sem atualizar este `rule.md`.
