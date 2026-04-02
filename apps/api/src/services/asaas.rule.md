# 💸 Asaas Integration Rules

> **ATENÇÃO:** Este arquivo contém diretrizes e informações sobre a integração com a API do Asaas (plataforma de pagamentos e cobranças).

## 🌍 Variáveis de Ambiente e Configuração

As credenciais do Asaas estão definidas no arquivo `apps/api/.env` e nunca devem ser expostas no lado do cliente.

- `ASAAS_API_URL`: URL base da API (ex: `https://sandbox.asaas.com/api/v3` para desenvolvimento).
- `ASAAS_API_KEY`: Chave de API exclusiva do ambiente atual.
- `ASAAS_USER_AGENT`: Identificação da aplicação no Asaas (ex: `auto_contrato_sandbox`).

## 🛠️ Padrões de Uso do Serviço

Deveremos criar um ou mais serviços em `apps/api/src/services/asaasService.ts` (ou similar) seguindo as regras abaixo:

1. **Cliente Axios:** Todas as requisições para o Asaas devem usar um cliente Axios configurado centralizadamente. 
   - O `baseURL` deve usar a variável `ASAAS_API_URL`.
   - O cabeçalho `access_token` deve usar `ASAAS_API_KEY`.
   - Pode ser exigido o `User-Agent`, configurado via `ASAAS_USER_AGENT`.
   - O cabeçalho `Content-Type` deve ser `application/json`.
2. **Ambiente:** O ambiente de testes/sandbox está configurado. Lembre-se que em produção essas variáveis devem ser preenchidas corretamente no servidor.
3. **Tratamento de Erros:** Englobe chamadas ao Asaas em blocos `try/catch` e faça parse amigável dos erros retornados pela API deles, já que costumam retornar objetos com o padrão `errors: [ { code, description } ]`.

## 🔄 Fluxo de Assinaturas e Cobranças (Planejamento)

*(Será expandido conforme implementação avançar)*
- **Clientes:** A API de clientes do Asaas (`/customers`) deve ser utilizada validando CPF/CNPJ de forma exata.
- **Cobranças:** Para gerar boletos, PIX ou cartões, use as URLs apropriadas (ex: `/payments`).
- **Webhooks:** Em caso de tratamento de callbacks do Asaas no futuro, deve-se criar uma rota específica e verificar a procedência dos eventos.
