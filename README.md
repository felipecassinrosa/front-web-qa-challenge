# Case Técnico — Engenharia de Qualidade Front Web (PlayLab)

## 1. Descrição da solução

Este repositório apresenta a suíte de automação Front Web desenvolvida para o **Case Técnico de Engenharia de Qualidade Front Web**, com foco em análise de risco, priorização orientada a valor, arquitetura sustentável, sincronização baseada em estado observável, acessibilidade, responsividade mobile e execução automatizada em CI/CD.

A documentação estratégica completa está em:
- [docs/estrategia-de-testes.md](./docs/estrategia-de-testes.md)
- [docs/matriz-de-riscos.md](./docs/matriz-de-riscos.md)
- [docs/matriz-de-cenarios.md](./docs/matriz-de-cenarios.md)

---

## 2. Aplicação utilizada

- **PlayLab — Playwright Practice Arena:** [https://playwrightlab.github.io/](https://playwrightlab.github.io/)

---

## 3. Escopo implementado

A suíte tem **8 testes** (dentro da faixa de 5 a 8 exigida), todos implementados e passando em `chromium`, `webkit` e `mobile-safari` — **13 execuções** no total, conforme a estratégia de navegadores da seção 8:

| ID | Módulo | Cenários de referência cobertos | Tags | Arquivo |
|---|---|---|---|---|
| `USR-E2E-01` | Tabela de Usuários — jornada principal | USR-01, 02, 03, 05, 06, 07, 08 | `@smoke`, `@users`, `@mobile` | `tests/users/user-management.spec.ts` |
| `USR-NEG-01` | Tabela de Usuários — busca sem resultado | USR-04 | `@users`, `@negative` | `tests/users/user-management.spec.ts` |
| `FRM-E2E-01` | Formulário — reset + cadastro válido | FRM-01, 05 | `@smoke`, `@forms`, `@mobile` | `tests/forms/registration-form.spec.ts` |
| `FRM-NEG-01` | Formulário — obrigatórios, e-mail e senha inválidos | FRM-02, 03, 06 | `@forms`, `@negative` | `tests/forms/registration-form.spec.ts` |
| `DYN-ASYNC-01` | Delayed Dropdown — carga assíncrona | DYN-01, 02, 06, 07 | `@smoke`, `@dynamic` | `tests/dynamic/delayed-dropdown.spec.ts` |
| `DYN-TBL-01` | Dynamic Table — colunas e linhas embaralhadas | DYN-03, 04, 05 | `@dynamic` | `tests/dynamic/dynamic-table.spec.ts` |
| `A11Y-01` | Acessibilidade — labels, teclado, foco, `axe-core` | A11Y-01, 02, 03, 04, 06, 07 | `@a11y` | `tests/accessibility/accessibility.spec.ts` |
| `RSP-MOB-01` | Responsividade — layout mobile | RSP-02, 03, 04, 05 | `@mobile`, `@mobile-only` | `tests/responsive/mobile-layout.spec.ts` |

---

## 4. Stack utilizada

- **Playwright Test** (`@playwright/test`)
- **TypeScript** (modo `strict`)
- **Node.js** (v24 LTS no CI / >= 20 local)
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
npm run test:negative
npm run test:responsive   # apenas o cenário de layout mobile (@mobile-only no projeto mobile-safari)

# Executar um único teste pelo ID
npx playwright test --grep "DYN-ASYNC-01"
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

O teste `A11Y-01` anexa ao relatório os resultados do `axe-core` (`axe-registration-form.json` e `axe-full-page.json`) e uma anotação com as violações conhecidas da aplicação.

### Pipeline (GitHub Actions)

O workflow [`.github/workflows/tests.yml`](./.github/workflows/tests.yml) roda em `push`/`pull_request` na `main` e manualmente (`workflow_dispatch`), com quatro jobs:

1. **`plan`** — monta a matriz de projetos a partir do input manual (`all`, `chromium`, `webkit` ou `mobile-safari`). A matriz é calculada num job próprio porque o GitHub não permite usar o contexto `matrix` no `if` de um job.
2. **`typecheck`** — `tsc --noEmit` como gate antes dos testes.
3. **`e2e-tests`** — um job por projeto, em paralelo (`fail-fast: false`), com cache de dependências npm e dos navegadores Playwright, e filtro opcional por tag.
4. **`merge-reports`** — junta os relatórios `blob` de todos os projetos em um único HTML (`playwright-report-merged`) e publica um resumo (passaram, falharam, flaky) na página da execução.

Os artefatos `playwright-report-<projeto>`, `test-results-<projeto>` (trace, vídeo e screenshot das falhas) e o relatório consolidado são publicados mesmo quando há falha (`if: !cancelled()`).

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
│   ├── forms/                   # Registration Form: caminho feliz com reset e validações negativas
│   ├── dynamic/                 # Delayed Dropdown (assíncrono) e Dynamic Table (embaralhada)
│   ├── accessibility/           # Teclado, foco, labels e auditoria axe-core
│   └── responsive/              # Layout e navegação em resolução mobile
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

1. **Prioridade 1 — Seletores semânticos:** `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText` (ex.: campos do Registration Form, menu hambúrguer `Toggle menu`, botões do Focus Trap). Os labels do formulário usam regex ancorada (`/^Password/`) porque `/Password/i` também casaria com o botão `Toggle password visibility` e causaria *strict mode violation*.
2. **Prioridade 2 — Contrato explícito (`getByTestId`):** usado quando o componente não possui nome acessível confiável (ex.: `#rowsPerPage`, `#tableFilter` e botões de ação da Tabela de Usuários, cuja falta de label foi identificada como defeito crítico de acessibilidade na auditoria `axe-core`).
3. **Proibido no projeto:** XPath absoluto, seletores acoplados a classes puramente visuais e índices posicionais fixos (`nth-child`). Na leitura de colunas de tabelas, o índice é resolvido dinamicamente a partir do texto do cabeçalho (`<thead>`), tanto na Tabela de Usuários (`getCell(row, 'Status')`) quanto na Dynamic Table.

---

## 13. Estratégia de sincronização

- Uso exclusivo de **auto-waiting** do Playwright e **web-first assertions** (`toBeVisible`, `toBeEnabled`, `toBeHidden`, `toHaveCount`, `toContainText`).
- **Zero `waitForTimeout`:** fluxos assíncronos (como o *Delayed Dropdown* de 2s) sincronizam pela transição de estados observáveis (exibição/ocultação do loader e habilitação do `<select>`).
- **Leituras em lote só depois de um estado confirmado:** antes de ler uma coluna inteira (`getColumnValues`, `readDynamicTableRecords`), o teste espera a contagem de linhas com `toHaveCount`, para não ler a tabela no meio de uma atualização.
- **Sem asserções sobre aleatoriedade:** a Dynamic Table embaralha colunas e linhas a cada carga, mas o teste não exige que a ordem mude após o reload (o sorteio pode repetir a ordem e geraria falha intermitente). Ele valida as regras que não mudam: fruta → cor/estação e faixas numéricas.
- **Verificação de estabilidade:** a suíte foi executada com `--repeat-each=3` (39/39 aprovados) antes da entrega.
- Timeouts globais configurados centralmente em `playwright.config.ts` (`timeout: 30s`, `expect: 10s`, `actionTimeout: 10s`).

---

## 14. Estratégia de dados de teste

- Todos os dados utilizados nos testes são **fictícios, sintéticos e seguros** (`@example.com`, números fictícios). O formulário usa `buildValidRegistrationUser()` em `src/data/userData.factory.ts`, que gera e-mail com sufixo único por invocação e aceita `overrides` para os cenários negativos (ex.: só o e-mail inválido).
- Dados de referência da aplicação (usuários semente da tabela, opções do dropdown, mensagens de validação e regras da Dynamic Table) ficam centralizados no mesmo módulo, e não espalhados pelos specs.
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
  - O container com scroll horizontal da tabela não é focável por teclado (`scrollable-region-focusable`), e o menu hambúrguer não expõe `aria-expanded` ao abrir/fechar (`RSK-A07`, `RSK-A08`).
- **Limitações da análise automatizada de acessibilidade (`axe-core`):** cobre estruturalmente regras detectáveis no DOM (~30–50% dos critérios WCAG), mas **não substitui** testes manuais com leitores de tela (VoiceOver/NVDA), verificação de clareza semântica, zoom 200% e operação assistiva por voz.

---

## 17. Uso de Inteligência Artificial

Em conformidade com a transparência solicitada no desafio:

- **Ferramentas utilizadas:**
  - **Antigravity** (assistente de engenharia com modelo Gemini) na etapa inicial: estruturação do repositório, inspeção exploratória do DOM/acessibilidade da aplicação-alvo e escrita da fundação de código e documentação.
  - **Claude Code** (Anthropic) na etapa de revisão: revisão do projeto contra o enunciado do case, correção dos defeitos encontrados e implementação dos 6 cenários restantes.
- **Atividades apoiadas:** bootstrap da configuração Playwright + TypeScript 7, roteiro de exploração técnica do PlayLab, redação inicial das matrizes/estratégia, scaffolding dos Page Objects/Fixtures/CI, especificação da Tabela de Usuários, revisão crítica da suíte e implementação dos cenários de formulário, dinâmicos, acessibilidade e responsividade.
- **Revisão e validação:** cada seletor e comportamento foi verificado em execução real contra `https://playwrightlab.github.io/` (inspeção com scripts Playwright e leitura do `app.js` público da aplicação para entender as regras da Dynamic Table e da ordenação), com `tsc --noEmit`, execução nos 3 projetos e `--repeat-each=3` para detectar instabilidade. Também foram feitos **testes de mutação manuais**: alterar um dado esperado (ex.: status `inactive`, cor da maçã) e confirmar que o teste falha.
- **Erros da IA identificados e corrigidos na revisão:**
  - A asserção de ordenação ASC era um **falso positivo**: a página 1 já vem em ordem alfabética, então o teste passava mesmo sem ordenação. Passou a validar a transição ASC → DESC e a ordem dos 15 registros.
  - A situação do usuário era validada com `toContainText('active')` na linha inteira, o que aceitaria `inactive`. Passou a usar a célula da coluna com `toHaveText` exato.
  - O seletor `getByLabel(/Password/i)` encontrava 2 elementos (campo + botão `Toggle password visibility`). Ainda não havia teste usando o seletor, então o erro passou despercebido — esta seção afirmava antes que "todos os seletores foram comprovados", o que não era verdade.
  - O workflow usava `matrix` no `if` de um job, o que o GitHub Actions não permite; a matriz passou a ser montada num job `plan`.
  - A documentação descrevia como "Coberto" cenários que ainda não existiam.
- **Outros ajustes:** durante o setup inicial, o TypeScript 7 rejeitou opções legadas (`moduleResolution: "Node"` e `baseUrl`), exigindo ajuste para `module: "ESNext"` + `moduleResolution: "Bundler"` e paths relativos; além disso, a varredura `axe-core` revelou que a aplicação possui violações pré-existentes, levando à decisão de bloquear apenas violações críticas no formulário e anexar o diagnóstico completo da página como evidência.
- **Decisões técnicas autorais:** escolha da estrutura em repositório isolado, estratégia multi-engine (`Chromium` completo + `WebKit` `@smoke` + `iPhone 13` `@mobile`), priorização dos 8 cenários, decisão de bloquear apenas violações críticas de acessibilidade, de não afirmar aleatoriedade na Dynamic Table e organização incremental de commits por domínio.

---

## 18. Próximos passos

1. Evoluir com testes de resiliência de rede utilizando `page.route` na seção `#network` (simulando 200, 500 e timeout de forma determinística).
2. Adicionar um projeto mobile Android (`Pixel 7`, Chromium) para os cenários `@mobile`, cobrindo a maior parte do público mobile brasileiro além do iPhone/WebKit.
3. Avaliar adição de `ESLint` + `eslint-plugin-playwright` na pipeline (ex.: regras `no-wait-for-timeout`, `no-force-option`, `missing-playwright-await`).
4. Transformar os achados de acessibilidade (`select-name`, `button-name`, `label`) em gates bloqueantes à medida que forem corrigidos no produto.
5. Teste visual seletivo (`toHaveScreenshot`) para o formulário e o modal, com snapshots gerados no mesmo SO da CI.
