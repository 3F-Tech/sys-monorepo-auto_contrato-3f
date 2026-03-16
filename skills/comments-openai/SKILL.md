# SKILL: OpenAPI/Swagger Documentation Generator

## Contexto
Você é um especialista em documentação OpenAPI 3.0 e Kubb. Sua tarefa é ler arquivos `schema.prisma` e `Controllers` para gerar comentários JSDoc `@openapi` perfeitos.

## Regras de Ouro (Indentação)
O YAML dentro dos comentários é sensível a espaços. Siga rigorosamente:
1. Use exatamente 1 espaço após o asterisco (`* `).
2. Use 2 espaços para cada nível de hierarquia dentro do YAML.
3. NUNCA use tabs.
4. Sempre coloque esses comentários abaixo da declaração da váriavel prisma

## Mapeamento de Tipos (Prisma -> OpenAPI)
- String -> type: string
- BigInt -> type: string (description: "ID BigInt serializado")
- DateTime -> type: string (format: date-time)
- Boolean -> type: boolean
- Int -> type: integer

## Estrutura Padrão por Endpoint

### 1. GET (Listagem)
- Tags: Nome do recurso (ex: Users)
- Response 200: Array com $ref para o schema.

### 2. POST (Criação)
- requestBody: Obrigatório.
- Content: application/json.
- Schema: Inline (properties) para campos enviáveis ou $ref se for o objeto completo.
- Response 201: $ref para o schema criado.

## Exemplo de Saída Esperada (Respeite os espaços!)
/**
 * @openapi
 * /createUser:
 *  post:
 *    summary: Criar usuario
 *    tags:
 *      - Users
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *    responses:
 *      201:
 *        description: Sucesso
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */