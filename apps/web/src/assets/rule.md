# Regras de Identidade Visual e Assets

## 🎨 Design System (FONTE DA VERDADE)
Este arquivo centraliza a identidade visual do projeto. **Nunca invente novas cores ou estilos sem atualizar este documento.**

### Paleta de Cores (Dark Mode)
| Token | Valor | Uso |
|---|---|---|
| `brand-deep` | `#0d1b2a` | Fundo principal / painel esquerdo |
| `brand-offset` | `#111c29` | Painel de formulários / cards |
| `brand-surface` | `rgba(255,255,255,0.06)` | Inputs e superfícies |
| `brand-cyan` | `#00d4ff` | Cor de destaque principal |
| `brand-blue` | `#0094ff` | Destaque secundário / Gradientes |

### Gradientes e Efeitos
- **Botões**: `linear-gradient(90deg, #00d4ff, #0094ff)`
- **Glassmorphism**: Use `backdrop-blur-sm` com bordas `white/10`.

### Assets
- **Logo 3F**: Armazenada em `src/assets/3F/3fventure-logo.jpg`. Use com `rounded-lg`.
- **Placeholder**: Em caso de falha de imagem, use gradientes da marca.

## 📐 Tipografia
- Use **Inter** ou sistema default.
- Labels: `text-[10px] uppercase font-bold tracking-widest text-brand-cyan`.
