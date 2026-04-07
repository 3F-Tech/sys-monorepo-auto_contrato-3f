# CLAUDE.md — Bootloader do Projeto

## Ritual Obrigatório
Antes de codar em qualquer pasta, **leia o `rule.md` dessa pasta**. Após mudanças relevantes, **atualize o `rule.md` correspondente**.

## Regras Globais (nunca violar)
- Composition API + `<script setup>` (nunca Options API em componentes Vue)
- Tailwind CSS dark mode only (nunca light mode, nunca cores fora da paleta)
- Nunca `alert()` ou `confirm()` nativos — usar `useToast` e `ConfirmModal`
- Nunca validação HTML nativa (`required`, `type="email"`) — toda validação via JS
- Textos sempre em **portugues** (exceto termos tecnicoss: "head", "admin", "P1", "TCV", "NMRR", "CAC")
- Bloquear scroll do body ao abrir modais (`overflow: hidden`)
- Kubb e o Swagger sao a fonte da verdade para tipos e hooks de API

## Entidade 3F (Empresa-Mae)
A "3F" e uma entidade **hardcoded no frontend** (`value: 'all'`). Representa a visao agregada de todas as BUs.
- **Nunca** inserir 3F como BU no banco de dados
- **Nunca** exibir 3F em formularios de criacao de usuario ou contrato
- Todas as comparacoes usam `=== 'all'` (nunca `=== '99'` ou filtro por nome)

## Referencias
- Manual completo (tecnico + negocio + contexto): `GEMINI.md`
- Design system e paleta: `apps/web/design-system.md`
- Mapa de rule.md locais: ver secao "Politica de Regras Locais" em `GEMINI.md`
