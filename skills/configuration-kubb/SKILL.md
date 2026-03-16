---
name: configuration-kubb
description: Especialista em configurar o Kubb v4 e integrar com swagger-jsdoc em monorepos. Use quando precisar (1) Atualizar o Kubb da v2 para v4, (2) Resolver o erro 'pluginSwagger is not a function', (3) Configurar o Kubb para ler um swagger.json estático, ou (4) Ajustar caminhos de geração de código.
---

# configuration-kubb

Esta skill automatiza a configuração "chata" do Kubb v4, garantindo que os plugins e scripts de geração de swagger estejam sempre em harmonia.

## Checklist de Instalação (PNPM)

Sempre verifique se o seu `package.json` raiz está usando as versões v4 dos plugins:

```bash
pnpm add -D @kubb/cli@latest @kubb/core@latest @kubb/plugin-oas@latest @kubb/plugin-ts@latest @kubb/plugin-zod@latest @kubb/plugin-client@latest
```

## Configuração Padrão (kubb.config.ts)

Na v4, os nomes dos plugins mudaram. Use sempre este template para evitar erros de "not a function":

```typescript
import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';
import { pluginClient } from '@kubb/plugin-client';

export default defineConfig({
    root: '.',
    input: {
        path: './apps/api/swagger.json', // Caminho do swagger estático
    },
    output: {
        path: './apps/web/src/gen',
        clean: true,
    },
    plugins: [
        pluginOas({ validate: true }),
        pluginTs({ output: { path: 'types' } }),
        pluginZod({ output: { path: 'zod' } }),
        pluginClient({ output: { path: 'hooks' } }),
    ],
});
```

## Schemas Globais e Relacionamentos (CRÍTICO)
O Kubb depende de definições globais para resolver referências `$ref`. Nunca pule esta configuração no `swagger.config.ts`:

1. **Mapeie tudo**: Crie um schema para cada modelo do Prisma, inclusive tabelas pivô (ex: `SellerBusiness`).
2. **BigInt aware**: Mapeie `BigInt` do Prisma como `type: 'string'` no Swagger com uma descrição avisando que está serializado.
3. **Nullable**: Se o campo é opcional no Prisma (`?`), use `nullable: true` no Swagger.

Exemplo de estrutura obrigatória:
```typescript
components: {
    schemas: {
        User: { ... },
        Role: { ... },
        UserRole: { // Tabela pivô
            type: 'object',
            properties: {
                user_id: { type: 'string' },
                role_id: { type: 'integer' }
            }
        }
    }
}
```

## Fluxo de Geração Estática

Para que o Kubb funcione sem o backend estar rodando, siga estes passos:

1. **Crie o script de geração**: Veja `assets/generate-swagger.ts.template`.
2. **Adicione ao package.json do API**:
   ```json
   "scripts": {
     "swagger": "tsx src/generate-swagger.ts"
   }
   ```
3. **Comando de geração total**:
   ```bash
   pnpm --filter api run swagger && pnpm exec kubb generate
   ```

## Referências Úteis
- Consulte `assets/generate-swagger.ts.template` para o script de extração de JSDoc.
- Consulte `assets/kubb.config.ts.template` para uma configuração completa.
