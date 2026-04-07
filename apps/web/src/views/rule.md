# Module: Views (Frontend)

## Responsabilidade
Atuam como páginas do projeto e **orquestradoras** de estado global e roteamento. A camada visual detalhada (inputs, botões, modais) deve ser extraída para a pasta `/components`. 

## Dependências
- **Vue Router**: Para redirecionamentos dinâmicos ao redor da aplicação (ex: `useRoute`, `useRouter`).
- **Pinia Stores**: Para injetar ou manipular estado persistente ou global (ex: Vendedor Logado, Empresa Atual).
- **Componentes**: Módulos visuais importados da pasta `src/components/`.

## Fluxo (Exemplo: LoginView)
1. Através de propriedades definidas nas rotas (`meta: { hideLayout: true }`), as Views ditam o comportamento do Layout Centralizado no arquivo raiz `App.vue`.
2. Ocupam-se de montar a estrutura Macro da página (ex: Divisão em duas colunas Grid/Flexbox).
3. Importam e renderizam componentes visuais menores (ex: `LoginForm`), repassando callbacks ou consumindo emissões de eventos.
4. Fazem a ponte entre a ação de um componente ("Clicou em Entrar") e o Back-end/Store (Disparar a store do usuário logado).
