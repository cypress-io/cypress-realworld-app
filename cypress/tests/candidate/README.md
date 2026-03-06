# 🧪 QA Technical Challenge GlobalThings

## 📌 Visão Geral

Este repositório contém a implementação de testes automatizados e documentação para o desafio técnico de QA.

O objetivo desta solução é demonstrar não apenas a validação do comportamento da aplicação, mas também boas práticas de engenharia de qualidade, incluindo:

- Arquitetura de testes
- Automação estável e reutilizável
- Estratégia baseada em risco
- Integração com CI/CD
- Governança de testes
- Uso prático de IA em QA

A abordagem adotada segue uma **pirâmide de testes simplificada**, priorizando confiabilidade, feedback rápido e manutenção simples.

---

## 🏗 Arquitetura

## Estrutura de Pastas

```
cypress/
  tests/
    candidate/
      e2e/
        smoke/
          login.spec.ts
        bankAccounts.spec.ts
        transactions.cy.ts
      api/
        api-auth.spec.ts
        api-bankAccount.spec.ts
      support/
        commands.ts
      fixtures/
        users.json
      README.md
```

### Justificativa da Estrutura (Rationale)

A organização segue o princípio de **separação de responsabilidades**.

| Pasta    | Responsabilidade                 |
| -------- | -------------------------------- |
| e2e      | Fluxos completos do usuário      |
| api      | Testes diretos de API            |
| support  | Helpers e comandos reutilizáveis |
| fixtures | Dados de teste reutilizáveis     |

Essa estrutura permite escalar a suíte mantendo legibilidade, organização e baixo acoplamento.

### 📊 Estratégia de Testes

A estratégia segue uma pirâmide de testes pragmática.

| Camada   | Objetivo                     | Exemplos                  |
| -------- | ---------------------------- | ------------------------- | ------------------- |
| UI / E2E | Validar jornadas críticas    | Login, envio de pagamento |
| API      | Validar serviços rapidamente | Endpoint de autenticação  | Criação de recursos |
| Manual   | Edge cases e exploração      | Validações complexas      |

O foco da automação está nos fluxos críticos de negócio.

### 🧱 Estratégia de Estabilidade

### Evitar waits fixos

Não são utilizados waits baseados em tempo.

Exemplo evitado:

```javascript
cy.wait(5000);
```

Os testes aguardam:

- respostas de rede
- mudanças no DOM
- retry automático do Cypress

---

## ⚙ Integração CI/CD

O projeto inclui um workflow GitHub Actions.

Localização:

```
.github/workflows/qa.yml
```

Pipeline:

1. Instalar dependências
2. Iniciar aplicação
3. Executar Cypress
4. Salvar artifacts em caso de falha

---

## 📋 Governança de Testes

Suites propostas:

- Smoke
  Fluxos críticos do sistema - Executados em CI a cada Pull Request
  Login
  Criação de conta bancária
  Envio de pagamento
  Recebimento
  Fluxos de API

- Autenticação
  Login
  Logout
  Validação de credenciais
  Controle de sessão

- Contas Bancárias
  Criação de conta bancária
  Edição de conta bancária
  Exclusão de conta bancária
  Validação de campos

- Transações
  Envio de pagamento
  Recebimento
  Validação de valores
  Visibilidade no feed

- Regressão
  Conjunto completo executado antes de releases
  Login
  Criação de conta bancária
  Edição de conta bancária
  Exclusão de conta bancária
  Envio de pagamento
  Recebimento
  Validação de valores
  FLuxos de API

### Exemplo de Test Plan para uma Release

**Release:** v1.3.0\
**Objetivo:** validar estabilidade das funcionalidades principais antes
da publicação.

### Escopo

- Autenticação
- Contas bancárias
- Transações
- APIs críticas

### Estratégia

Executar:

1.  Smoke Suite (PR pipeline)
2.  Testes de API
3.  Testes de fluxo de pagamento
4.  Regressão parcial

### Critérios de entrada

- Build estável
- 100% dos testes smoke aprovados
- Ambiente disponível
- Banco de dados seedado

### Critérios de saída

- Nenhum bug crítico ou bloqueante aberto
- Testes exploratórios
- Testes de regressão com no máximo falhas conhecidas documentadas
- Documentação sobre o teste

### 🧾 Exemplos de Casos de Teste Manuais

TC-01 - Login com credenciais válidas

Pré-condições: Usuário válido cadastrado no sistema

Passos

1. Acessar a página de login
2. Inserir username válido
3. Inserir senha válida
4. Clicar em Login

Resultado esperado: Usuário autenticado com sucesso - Redirecionamento para a página inicial - Nome do usuário exibido no menu lateral

---

TC-02 - Login com senha inválida

Pré-condições: Usuário válido cadastrado

Passos

1. Acessar página de login
2. Inserir username válido
3. Inserir senha inválida
4. Clicar em Login

Resultado esperado: Autenticação negada - Mensagem de erro exibida ao usuário

---

TC-03 - Criar nova conta bancária

Pré-condições: Usuário autenticado

Passos:

1. Acessar seção Bank Accounts
2. Clicar em Create
3. Informar nome do banco
4. Informar routing number
5. Informar account number
6. Confirmar criação

Resultado esperado: Conta criada com sucesso - Conta exibida na
lista de contas bancárias

---

TC-04 - Validação de campos obrigatórios na criação de conta bancária

Pré-condições: Usuário autenticado

Passos:

1. Acessar seção Bank Accounts
2. Clicar em Create
3. Tentar salvar

Resultado esperado: Sistema impede a criação - Mensagens de validação exibidas para campos obrigatórios

---

TC-05 - Enviar pagamento para outro usuário

Pré-condições: Usuário autenticado - Conta bancária cadastrada

Passos:

1. Clicar em New Transaction
2. Selecionar usuário destinatário
3. Informar valor da transação
4. Informar descrição
5. Confirmar pagamento

Resultado esperado: Transação criada com sucesso - Transação exibida no feed do usuário

---

TC-06 - Enviar pagamento com valor inválido

Pré-condições: Usuário autenticado

Passos:

1. Clicar em New Transaction
2. Selecionar usuário destinatário
3. Informar valor da transação inválido (ex: negativo ou zero)
4. Confirmar pagamento

Resultado esperado: Sistema bloqueia envio - Mensagem de erro exibida ou botão de envio bloqueado

---

### Modelo de Rastreabilidade

Feature Caso de Teste Bug Release

---

Login TC-01 BUG-101 v1.3.0
Login TC-02 BUG-102 v1.3.0
Bank Accounts TC-03 BUG-120 v1.3.0
Bank Accounts TC-04 BUG-121 v1.3.0
Transactions TC-05 BUG-140 v1.3.0
Transactions TC-06 BUG-141 v1.3.0

Esse modelo permite:

- rastrear impacto de mudanças
- identificar rapidamente testes afetados
- acompanhar qualidade por release

---

## 🤖 Uso de Inteligência Artificial em QA

Possíveis aplicações:

- geração de cenários de teste a partir de PRs
- análise automática de falhas
- geração de dados de teste

### Limitações

Modelos de IA podem gerar recomendações incorretas, exigindo validação humana.

---

## 📈 Métrica Sugerida

Taxa de testes flaky:

flaky_tests / total_test_runs

Outras métricas:

- tempo médio para detectar regressões
- tempo de execução da suíte
- cobertura de fluxos críticos

---

## ▶ Executando Localmente

Instalar dependências

```
yarn
```

Iniciar aplicação

```
yarn dev
```

Abrir Cypress

```
yarn cypress:open
```

Executar headless

```
yarn cypress:run
```

---

## ✅ Considerações Finais

Esta solução prioriza:

- confiabilidade da automação
- feedback rápido no pipeline
- arquitetura escalável
- governança clara de testes

O objetivo é demonstrar maturidade em estratégia de qualidade e liderança técnica em QA.
