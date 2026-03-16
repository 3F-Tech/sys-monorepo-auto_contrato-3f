# Sistema de Design: Automação de Contratos

Este documento define a identidade visual do projeto. **Todos os futuros desenvolvimentos de UI devem seguir estritamente estas regras.**

## 1. Estética: Dark Tech / Ultra-Minimalista
A marca utiliza uma paleta escura profunda com acentos de ciano vibrante. O design deve parecer premium, limpo e futurista.

## 2. Paleta de Cores (Tokens do Tailwind)
Use o namespace `brand` no Tailwind:

| Token | Valor | Papel |
| :--- | :--- | :--- |
| `brand-deep` | `#0d1b2a` | Fundo Primário |
| `brand-offset` | `#111c29` | Painéis, Cards, Fundo Secundário |
| `brand-cyan` | `#00d4ff` | Acento Primário, Ícones, Estados Ativos |
| `brand-blue` | `#0094ff` | Acento Secundário, Gradientes |
| `brand-surface` | `rgba(255, 255, 255, 0.06)` | Fundos de Input/Vidro |
| `brand-glass-border` | `rgba(255, 255, 255, 0.1)` | Bordas Sutis |

## 3. Componentes Globais
Use as classes CSS estabelecidas em `src/style.css`:

### Botões
- **Classe**: `.btn-primary`
- **Estilo**: Gradiente (`brand-cyan` para `brand-blue`), texto escuro (`brand-deep`), cantos arredondados, redimensionamento/brilho sutil no hover.

### Inputs
- **Classe**: `.input-glass`
- **Estilo**: Fundo transparente (`brand-surface`), borda sutil (`brand-glass-border`), tipografia refinada, anel de foco em ciano.

## 4. Tipografia
- **Títulos (Headings)**: Sans-serif, Negrito (ou Extrabold), tracking-tight.
- **Subtítulos (Eyebrows)**: Maiúsculas, espaçamento entre letras (tracked-out), acento em ciano.
- **Corpo (Body)**: Sans-serif limpa (Fonte padrão do sistema ou Inter/Roboto).

## 5. Checklist de Consistência Visual
- [ ] O fundo é sempre `brand-deep` ou `brand-offset`.
- [ ] Sem cores genéricas (Vermelho, Verde, Azul) — use os equivalentes da marca ou variações refinadas.
- [ ] Manter espaço negativo generoso.
- [ ] As interações devem ter transições suaves (200ms).
