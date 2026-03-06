
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

| Pasta | Responsabilidade |
|------|-------------------|
| e2e | Fluxos completos do usuário |
| api | Testes diretos de API |
| support | Helpers e comandos reutilizáveis |
| fixtures | Dados de teste reutilizáveis |

Essa estrutura permite escalar a suíte mantendo legibilidade, organização e baixo acoplamento.

### 📊 Estratégia de Testes

A estratégia segue uma pirâmide de testes pragmática.

| Camada | Objetivo | Exemplos |
|------|----------|----------|
| UI / E2E | Validar jornadas críticas | Login, envio de pagamento |
| API | Validar serviços rapidamente | Endpoint de autenticação | Criação de recursos
| Manual | Edge cases e exploração | Validações complexas |

O foco da automação está nos fluxos críticos de negócio.


### 🧱 Estratégia de Estabilidade

### Evitar waits fixos

Não são utilizados waits baseados em tempo.

Exemplo evitado:

```javascript
cy.wait(5000)
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
- Autenticação
- Contas Bancárias
- Transações
- Regressão

---

## 🧾 Exemplos de Casos de Teste Manuais

TC‑01 — Login com sucesso

Pré‑condição:
Usuário válido cadastrado.

Passos:
1. Acessar login
2. Inserir usuário válido
3. Inserir senha válida
4. Clicar em login

Resultado esperado: Usuário autenticado.

---

TC‑02 — Login com senha inválida

Pré‑condição:
Usuário válido cadastrado.

Passos:
1. Acessar login
2. Inserir usuário válido
3. Inserir senha inválida
4. Clicar em login

Resultado esperado: Mensagem de erro exibida.

---

TC‑03 — Criar conta bancária

Resultado esperado:
Conta exibida na lista.

---

TC‑04 — Validação de campos obrigatórios

Resultado esperado:
Mensagem de validação exibida.

---

TC‑05 — Enviar pagamento

Resultado esperado:
Pagamento realizado com sucesso.

---

TC‑06 — Pagamento inválido

Resultado esperado:
Erro de validação exibido.

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
