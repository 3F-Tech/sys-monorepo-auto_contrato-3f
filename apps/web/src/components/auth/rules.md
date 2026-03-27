# Module: Autenticação (Frontend)

## Responsabilidade

Contém todos os componentes visuais focados no fluxo de autenticação do usuário, sendo acionados pelas `views` correspondentes. O objetivo principal é isolar a lógica de interface (apresentação) do roteamento.

## Dependências

- **Lucide Icons**: Utiliza os ícones do pacote `lucide-vue-next` (ex: `Eye`, `EyeOff`).
- **TailwindCSS**: Utilitários para formatação responsiva e estilização visual (ex: inputs, botões, modais).

## Fluxo

1. O componente recebe (ou gerencia localmente, como o toggle de senha) o estado do formulário.
2. Emite eventos (`@submit`) para que a View orquestradora (ex: `LoginView`) decida qual será a chamada para a API ou Mutation na Store.
3. Não deve realizar chamadas diretas ou roteamentos forçados, apenas expor eventos e props para a camada superior.

## Validação

1. NUNCA use `required`, `type="email"` ou qualquer validação nativa do HTML. TODA validação deve ser feita via JavaScript no método `handleSubmit`, usando o componente de alerta customizado para exibir erros.
