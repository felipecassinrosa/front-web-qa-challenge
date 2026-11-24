# Case Técnico — Engenharia de Qualidade Front Web (PlayLab)

## 1. Descrição da solução

Este repositório apresenta a estrutura base de automação Front Web desenvolvida para o **Case Técnico de Engenharia de Qualidade Front Web**, com foco em análise de risco, priorização orientada a valor, arquitetura sustentável, sincronização baseada em estado observável, acessibilidade, responsividade mobile e execução automatizada em CI/CD.

A documentação estratégica completa está em:
- [docs/estrategia-de-testes.md](./docs/estrategia-de-testes.md)
- [docs/matriz-de-riscos.md](./docs/matriz-de-riscos.md)
- [docs/matriz-de-cenarios.md](./docs/matriz-de-cenarios.md)

---

## 2. Aplicação utilizada

- **PlayLab — Playwright Practice Arena:** [https://playwrightlab.github.io/](https://playwrightlab.github.io/)

---

## 3. Escopo implementado

A matriz define **8 cenários priorizados** (dentro da faixa de 5 a 8 testes exigida). A fundação já entregue e validada inclui a arquitetura completa (`src/`), pipeline CI/CD e os cenários de referência da jornada principal, deixando os demais módulos prontos para evolução incremental:

| ID | Módulo | Tags | Status |
|---|---|---|---|
| `USR-E2E-01` | Tabela de Usuários (jornada principal: carga, headers, busca, paginação, sort, exclusão) | `@smoke`, `@users`, `@mobile` | Implementado |
| `USR-NEG-01` | Tabela de Usuários (busca por usuário inexistente) | `@users`, `@negative` | Implementado |
| `FRM-E2E-01` | Formulário de Cadastro (dados válidos + sucesso + reset) | `@smoke`, `@forms`, `@mobile` | Planejado |
| `FRM-NEG-01` | Formulário de Cadastro (obrigatórios, e-mail inválido, senha curta, termos) | `@forms`, `@negative` | Planejado |
| `DYN-ASYNC-01` | Delayed Dropdown (carregamento assíncrono observável sem `waitForTimeout`) | `@smoke`, `@dynamic` | Planejado |
| `DYN-TBL-01` | Dynamic Table (leitura resiliente com colunas e linhas permutadas) | `@dynamic` | Planejado |
| `A11Y-01` | Acessibilidade (labels, teclado, `aria-expanded`, Focus Trap e `axe-core`) | `@a11y` | Planejado |
| `RSP-MOB-01` | Responsividade Mobile (`iPhone 13 — 390×844`, overflow, menu e breakpoints) | `@mobile`, `@mobile-only` | Planejado |

---

## 4. Stack utilizada

- **Playwright Test** (`@playwright/test`)
- **TypeScript** (modo `strict`)
- **Node.js** (v22+ no CI / compatível com ambiente local)
- **`@axe-core/playwright`** (auditoria automatizada WCAG 2.0/2.1 A e AA)
- **`dotenv`** (configuração centralizada via variáveis de ambiente)
- **GitHub Actions** (CI/CD com matriz de projetos e artefatos)

---

## 5. Pré-requisitos

- **Node.js** >= 20 LTS
- **npm** >= 10
- Acesso de rede a `https://playwrightlab.github.io/`

---

## 6. Instruções de instalação

```bash
# 1. Instalar dependências do projeto
npm ci

# 2. Instalar os navegadores configurados na estratégia (Chromium e WebKit)
npx playwright install chromium webkit

# 3. (Opcional) Configurar variáveis locais a partir do exemplo
cp .env.example .env
```

---

## 7. Instruções de execução

```bash
# Validar tipagem estrita TypeScript
npm run typecheck

# Executar toda a estratégia configurada (Chromium + WebKit @smoke + Mobile Safari @mobile)
npm test

# Executar com navegador visível ou UI interativa do Playwright
npm run test:headed
npm run test:ui

# Executar seletivamente por tag / domínio
npm run test:smoke
npm run test:users
npm run test:forms
npm run test:dynamic
npm run test:a11y
npm run test:responsive
```

---

## 8. Execução por navegador

A estratégia multi-browser combina **Chromium** (suíte completa) e **WebKit** (fluxos críticos `@smoke`), equilibrando cobertura cross-engine com tempo enxuto de pipeline:

```bash
# Suíte desktop completa no Chromium (1280x720)
npm run test:chromium

# Subconjunto crítico @smoke no WebKit / Desktop Safari (1280x720)
npm run test:webkit
```

---

## 9. Execução mobile

O projeto `mobile-safari` utiliza o perfil `iPhone 13` (`390×844`, motor WebKit mobile com suporte a toque) e executa todos os cenários marcados com `@mobile`:

```bash
npm run test:mobile
```

---

## 10. Geração e abertura do relatório

Toda execução gera automaticamente:
- **Relatório HTML** em `playwright-report/`;
- **Screenshots**, **vídeos** e **traces** em `test-results/` sempre que houver falha (`screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'retain-on-failure'`).

Para abrir o relatório HTML localmente:

```bash
npm run report
```

Para inspecionar um trace salvo após falha:

```bash
npx playwright show-trace test-results/<pasta-do-teste>/trace.zip
```

No GitHub Actions, os artefatos `playwright-report-<projeto>` e `test-results-<projeto>` são publicados mesmo em caso de falha (`if: always()`).

---

## 11. Arquitetura do projeto

```text
front-web-qa-challenge/
├── .github/workflows/
│   └── tests.yml                # Pipeline GitHub Actions (typecheck + matriz + filtros manuais)
├── docs/
│   ├── estrategia-de-testes.md  # Estratégia completa e critérios de cobertura
│   ├── matriz-de-riscos.md      # Riscos funcionais, técnicos, UX, a11y e achados reais
│   └── matriz-de-cenarios.md    # Cenários priorizados (automatizados e fora de escopo)
├── src/
│   ├── data/
│   │   └── userData.factory.ts  # Factories e constantes de massa fictícia controlada
│   ├── fixtures/
│   │   └── test.fixtures.ts     # Custom fixtures injetando Page Objects nos testes
│   ├── pages/
│   │   ├── BasePage.ts
│   │   ├── UsersTablePage.ts
│   │   ├── RegistrationFormPage.ts
│   │   ├── DynamicComponentsPage.ts
│   │   ├── AccessibilityPage.ts
│   │   └── ResponsivePage.ts
│   └── utils/
│       └── a11y.helper.ts       # Wrapper do axe-core com anexo automático no relatório HTML
├── tests/
│   ├── users/                   # Jornada principal e cenário negativo da Tabela de Usuários
│   ├── forms/                   # Cenários planejados do Registration Form
│   ├── dynamic/                 # Cenários planejados de componentes assíncronos/dinâmicos
│   ├── accessibility/           # Cenário planejado de acessibilidade
│   └── responsive/              # Cenário planejado de layout mobile
├── .env.example
├── .gitignore
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── README.md
```

**Separação de responsabilidades:**
- **`src/pages/`:** encapsula seletores e ações orientadas à intenção do negócio, mantendo as asserções visíveis nos arquivos `*.spec.ts`.
- **`src/fixtures/`:** injeta Page Objects via `test.extend`, eliminando boilerplate de instanciação repetitiva.
- **`src/data/`:** centraliza factories de dados fictícios e sementes conhecidas, evitando acoplamento a dados reais ou estado compartilhado.
- **`src/utils/`:** concentra utilitários transversais (como a execução e anexo de relatório do `axe-core`).

---

## 12. Estratégia de seletores

Hierarquia adotada para maximizar resiliência e aproximar o teste do comportamento real do usuário:

1. **Prioridade 1 — Seletores semânticos:** `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText` (ex.: campos do Registration Form e botões de ação com nome acessível).
2. **Prioridade 2 — Contrato explícito (`getByTestId`):** usado quando o componente não possui nome acessível confiável (ex.: `#rowsPerPage`, `#tableFilter` e botões de ação da Tabela de Usuários, cuja falta de label foi identificada como defeito crítico de acessibilidade na auditoria `axe-core`).
3. **Proibido no projeto:** XPath absoluto, seletores acoplados a classes puramente visuais e índices posicionais fixos (`nth-child`). Na leitura de colunas de tabelas, o índice é resolvido dinamicamente a partir do texto do cabeçalho (`<thead>`).

---

## 13. Estratégia de sincronização

- Uso exclusivo de **auto-waiting** do Playwright e **web-first assertions** (`toBeVisible`, `toBeEnabled`, `toBeHidden`, `toHaveCount`, `toContainText`).
- **Zero `waitForTimeout`:** fluxos assíncronos (como o *Delayed Dropdown* de 2s) sincronizam pela transição de estados observáveis (exibição/ocultação do loader e habilitação do `<select>`).
- Timeouts globais configurados centralmente em `playwright.config.ts` (`timeout: 30s`, `expect: 10s`, `actionTimeout: 10s`).

---

## 14. Estratégia de dados de teste

- Todos os dados utilizados nos testes são **fictícios, sintéticos e seguros** (`@example.com`, números fictícios), gerados em `src/data/userData.factory.ts` com sufixo único por invocação.
- Cada teste executa em um `BrowserContext` isolado e independente de ordem (`fullyParallel: true`), sem compartilhamento de estado mutável.
- Nenhuma credencial, token ou dado sensível é versionado no repositório.

---

## 15. Decisões técnicas

- **Playwright + TypeScript:** escolhido por oferecer auto-waiting nativo, execução multi-engine (Chromium/WebKit) sem drivers externos, Trace Viewer rico para diagnóstico e tipagem estrita.
- **Chromium completo + WebKit `@smoke` + Mobile Safari `@mobile`:** trade-off consciente que entrega validação cross-engine e mobile iOS mantendo o tempo de CI enxuto e respeitando a restrição de não sobrecarregar a aplicação com paralelismo excessivo (`workers: 2` em CI).
- **O que não automatizar em E2E:** combinações exaustivas de regras de campo (melhor cobertas em testes unitários/componente), chamadas reais a APIs de terceiros sem mock (`jsonplaceholder`), seções secundárias fora do domínio administrativo (Shopping, Media, Carousel) e validações manuais de tecnologia assistiva.

---

## 16. Limitações conhecidas

- **Sem persistência backend:** o PlayLab mantém mutações da tabela apenas em memória; recarregar a página restaura os 15 usuários originais.
- **Defeitos reais observados na aplicação-alvo (documentados em `docs/matriz-de-riscos.md`):**
  - Busca por usuário inexistente renderiza tabela vazia sem empty state e exibe `"Showing 1-0 of 0 entries"` (`RSK-U01`).
  - Campo `Bio` não bloqueia entrada acima do limite de 200 caracteres (`210/200` submete com sucesso — `RSK-F06`).
  - Exclusão de usuário na tabela ocorre imediatamente sem diálogo de confirmação (`RSK-F07`).
  - Violações críticas de acessibilidade detectadas pelo `axe-core` na tabela de usuários (`select-name`, `label`, `button-name`) e violação séria `label-content-name-mismatch` na seção `#a11y`.
- **Limitações da análise automatizada de acessibilidade (`axe-core`):** cobre estruturalmente regras detectáveis no DOM (~30–50% dos critérios WCAG), mas **não substitui** testes manuais com leitores de tela (VoiceOver/NVDA), verificação de clareza semântica, zoom 200% e operação assistiva por voz.

---

## 17. Uso de Inteligência Artificial

Em conformidade com a transparência solicitada no desafio:

- **Ferramenta utilizada nesta etapa inicial:** Antigravity (assistente de engenharia com modelo Gemini) para apoiar na estruturação inicial do repositório, inspeção exploratória automatizada do DOM/acessibilidade da aplicação-alvo e escrita da fundação de código e documentação.
- **Atividades apoiadas:** bootstrap da configuração Playwright + TypeScript 7, roteiro de exploração técnica do PlayLab, redação inicial das matrizes/estratégia, scaffolding dos Page Objects/Fixtures/CI e especificação de referência da Tabela de Usuários.
- **Revisão e validação:** todos os seletores, comportamentos e defeitos documentados foram comprovados em execução real contra `https://playwrightlab.github.io/`, com validação de tipagem (`tsc --noEmit`) e execução real nos 3 projetos Playwright (`chromium`, `webkit`, `mobile-safari`).
- **Ajustes e limitações identificadas:** durante o setup inicial, o TypeScript 7 rejeitou opções legadas (`moduleResolution: "Node"` e `baseUrl`), exigindo ajuste para `module: "ESNext"` + `moduleResolution: "Bundler"` e paths relativos; além disso, a varredura `axe-core` inicial revelou que a aplicação possui violações pré-existentes, levando à decisão técnica de escopar asserções bloqueantes e anexar o diagnóstico completo como evidência.
- **Decisões técnicas autorais:** escolha da estrutura em repositório isolado, estratégia multi-engine (`Chromium` completo + `WebKit` `@smoke` + `iPhone 13` `@mobile`), priorização dos 8 cenários e organização incremental de commits para evolução contínua (incluindo continuidade da implementação dos demais cenários planejados).

---

## 18. Próximos passos

1. Implementar os 6 cenários planejados restantes (`FRM-E2E-01`, `FRM-NEG-01`, `DYN-ASYNC-01`, `DYN-TBL-01`, `A11Y-01` e `RSP-MOB-01`) em commits incrementais por domínio.
2. Atualizar os status em `docs/matriz-de-cenarios.md` e neste `README.md` conforme cada módulo for concluído.
3. Evoluir com testes de resiliência de rede utilizando `page.route` na seção `#network` (simulando 200, 500 e timeout de forma determinística).
4. Avaliar adição de `ESLint` + `eslint-plugin-playwright` na pipeline para reforçar padrões de qualidade automaticamente.
