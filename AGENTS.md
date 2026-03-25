# AGENTS.md - Automação de Contratos

## Build, Lint & Test Commands

### Root Commands (Turborepo)

```bash
pnpm dev              # Run both API and Web in development
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm codegen          # Generate API client from Swagger (Kubb)
pnpm clean            # Clean build artifacts and node_modules
```

### API (apps/api)

```bash
cd apps/api
pnpm dev              # Start API with nodemon (watch mode)
pnpm build            # Compile TypeScript to dist/
pnpm start            # Run production build
pnpm db:push          # Push Prisma schema to database
pnpm db:generate      # Generate Prisma client
pnpm swagger          # Generate Swagger documentation
```

### Web (apps/web)

```bash
cd apps/web
pnpm dev              # Start Vite dev server
pnpm codegen          # Generate types and hooks from Swagger
pnpm build            # Type-check + build for production
pnpm preview          # Preview production build
```

## Code Style Guidelines

### General

- **Language:** Portuguese for UI, English for code (variables, functions, comments in English when needed)
- **No Options API:** Use Vue 3 Composition API with `<script setup>` only
- **No Light Mode:** Dark theme only (`#0d1b2a` background, `#00d4ff` accent)
- **No Native Alerts:** Never use `alert()` or `confirm()` - use custom Toast/Modal components

### TypeScript

- Use explicit types for function parameters and return values
- Avoid `any`, use `unknown` when type is truly unknown
- Use interfaces for object shapes, types for unions/aliases

### Imports & Organization

```typescript
// Order: external → internal → relative
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { ContractService } from "@/services/contract";
import type { Contract } from "@/types";
```

### Naming Conventions

- **Files:** kebab-case (`contract-form.vue`, `google-drive.service.ts`)
- **Components:** PascalCase (`ContractForm.vue`)
- **Functions/variables:** camelCase (`getContracts`, `isLoading`)
- **Constants:** UPPER_SNAKE_CASE
- **Interfaces:** PascalCase with `I` prefix optional (`User`, `ContractData`)

### Vue 3 Best Practices

```vue
<script setup lang="ts">
// Props and emits with defineProps/defineEmits
const props = defineProps<{
  modelValue: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", data: FormData): void;
}>();
</script>
```

### Error Handling

- Use try/catch with proper error logging
- Return meaningful error messages to frontend
- Never expose sensitive information in error responses
- Use Zod for input validation on API endpoints

### Database (Prisma)

- Use singleton pattern for PrismaClient (`apps/api/src/prisma.ts`)
- Use connection pooler in production: `?pgbouncer=true` in DATABASE_URL
- Use DIRECT_URL (port 5432) only for migrations

## Project Structure

```
automacao_contratos/
├── apps/
│   ├── api/           # Express + Prisma backend
│   │   └── src/
│   │       ├── controllers/   # Route handlers
│   │       ├── services/       # Business logic
│   │       ├── schemas/        # Zod validation
│   │       ├── middleware/    # Auth, logging
│   │       └── prisma.ts       # DB singleton
│   └── web/           # Vue 3 frontend
│       └── src/
│           ├── api/            # Axios client + Kubb generated
│           ├── components/     # Reusable UI components
│           ├── views/          # Page components
│           ├── store/          # Pinia stores
│           └── router/         # Vue Router config
├── packages/
│   ├── tsconfig/      # Shared TypeScript config
│   └── api-client/    # Generated from Swagger
└── turbo.json         # Turborepo configuration
```

## Important Files to Read First

Before making changes, ALWAYS read these files:

1. `.antigravityrules.md` - Master development rules
2. `CONTEXT.md` - Project business context
3. `apps/api/src/controllers/rule.md` - Backend conventions
4. `apps/web/src/store/rule.md` - Frontend state management
5. `apps/web/src/router/rule.md` - Routing and guards

## Environment Variables

Required in `apps/api/.env`:

- `DATABASE_URL` - PostgreSQL with pgbouncer
- `DIRECT_URL` - PostgreSQL for migrations (no pgbouncer)
- `JWT_SECRET` - Secret for JWT token signing
- `CLICKSIGN_API_TOKEN` - Clicksign API key
- `GOOGLE_SERVICE_ACCOUNT` - JSON credentials for Google Drive/Docs

## Key Dependencies

- **API:** express, prisma, zod, googleapis, jsonwebtoken
- **Web:** vue 3, pinia, vue-router, apexcharts, axios
- **Shared:** turborepo, pnpm, typescript, tailwindcss

## Common Tasks

### Add new API endpoint

1. Create/update JSDoc comments in controller
2. Add route to `apps/api/src/routes/index.ts`
3. Run `pnpm swagger` to update Swagger JSON
4. Run `pnpm codegen` in web to regenerate types

### Add new feature to frontend

1. Check Kubb-generated types first (`apps/web/src/gen/`)
2. Use existing Pinia stores or create new one
3. Follow component patterns in `apps/web/src/components/`
4. Test mobile-first responsive design

### Database changes

1. Edit `apps/api/prisma/schema.prisma`
2. Run `pnpm db:push`
3. Run `pnpm db:generate`
