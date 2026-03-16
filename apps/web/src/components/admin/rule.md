# Regras dos Componentes de Admin

## 🎯 Responsabilidade
Os componentes em `src/components/admin` são peças reutilizáveis (formulários, modais, cards) para o painel administrativo. Eles devem lidar com a complexidade de validação e interação com o usuário.

## 🛠️ Padrões de Implementação
1. **Validação de Formulários**: Campos obrigatórios devem ser sinalizados. Use feedback em tempo real onde possível.
2. **Operações Complexas**: Componentes que salvam dados em múltiplas tabelas (ex: Vendedor + Vínculo com Empresas) devem gerenciar o estado de carregamento global da operação.
3. **Criptografia**: Para senhas de novos usuários, o hash MD5 deve ser gerado no frontend antes do envio, seguindo o padrão legado do projeto.
4. **Tipagem**: Sempre utilize os tipos gerados pelo Kubb em `src/gen/types` para garantir consistência com o banco.
5. **Máscaras de Input**: Utilize a diretiva `v-maska` para campos formatados (CPF, CNPJ, Telefone) para garantir a integridade da UX.

## 🧩 Modais Específicos
- **UserModal**: Deve permitir associar um vendedor a um "Head" e a múltiplas Unidades de Negócio (BUs).
- **BusinessModal**: Deve permitir definir a cor da marca e informações cadastrais.

## 🎨 Design system
- Use os tokens de cor da `tailwind.config.cjs`.
- Ícones devem vir de `lucide-vue-next`.
