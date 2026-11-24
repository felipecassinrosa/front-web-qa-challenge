# Estratégia de Testes — Front Web (PlayLab)

## 1. Objetivo

Definir uma estratégia pragmática, baseada em risco e sustentável para iniciar a automação Front Web da aplicação [PlayLab — Playwright Practice Arena](https://playwrightlab.github.io/).

O foco não é maximizar a quantidade de testes E2E, mas proteger as jornadas de maior valor de negócio e risco técnico com uma suíte enxuta (**8 cenários automatizados**), determinística, rápida, legível e pronta para evoluir em CI/CD.

---

## 2. Escopo

A estratégia cobre obrigatoriamente os pilares críticos identificados na análise exploratória da aplicação:

- **Jornada principal — Tabela de Usuários (`#tables` / User Management):** carregamento de registros, estrutura de cabeçalhos, pesquisa de usuário existente, ordenação de coluna, paginação, ação de exclusão com validação de estado final e cenário negativo de busca sem resultados.
- **Formulário de Cadastro (`#forms` / Registration Form):** submissão válida com massa fictícia controlada, feedback de confirmação, reset do formulário e cenários negativos de validação obrigatória/formato.
- **Componentes Dinâmicos e Assíncronos:**
  - *Delayed Dropdown* (carregamento assíncrono com estado de loading e habilitação tardia);
  - *Dynamic Table* (`#dynamicFruitTable`, cujas colunas e linhas mudam de ordem a cada reload com valores aleatórios).
- **Acessibilidade (`a11y`):** associação semântica de labels no formulário, navegação por teclado, atributos ARIA (`aria-expanded`, `role="dialog"` / focus trap) e análise automatizada via `@axe-core/playwright`.
- **Responsividade (Mobile):** validação em viewport mobile (`iPhone 13 — 390×844`) garantindo ausência de overflow horizontal global, menu responsivo, empilhamento de layout e operação da jornada crítica em tela reduzida.
- **Compatibilidade entre navegadores:** estratégia multi-engine combinando **Chromium** e **WebKit**.
- **Execução contínua e diagnóstico:** pipeline GitHub Actions com relatório HTML, screenshots, vídeos e traces retidos em falhas.

---

## 3. Fora de escopo

Para manter o custo de manutenção controlado e respeitar as restrições técnicas do desafio, ficam conscientemente **fora da automação E2E inicial**:

- **Testes de carga, stress, DoS ou loops contínuos** (explicitamente restritos pelo enunciado).
- **Varreduras de segurança ou exploração de vulnerabilidades** (escopo de AppSec, não de automação funcional Front Web).
- **Seções secundárias de menor prioridade para o contexto administrativo** (ex.: Shopping, Media Player, Carousel, Drag & Drop, iFrames externos, Basic Auth externo em `httpbin.org`, Shadow DOM) — documentadas na matriz como candidatos para fases futuras caso ganhem criticidade de negócio.
- **Validações puramente estéticas ou granulares de regra de campo** (ex.: combinações exaustivas de regex de e-mail, força de senha em cada nível, todas as combinações de checkboxes) — quando há acesso ao código-fonte, esse tipo de verificação pertence prioritariamente a **testes unitários e de componente**, não à camada E2E.
- **Chamadas diretas a APIs externas de terceiros sem isolamento** (ex.: `jsonplaceholder.typicode.com` na seção Network) na suíte principal, para evitar flakiness por indisponibilidade externa (recomendado apenas com `page.route` em expansão futura).

---

## 4. Riscos identificados

A análise detalhada está registrada em [matriz-de-riscos.md](./matriz-de-riscos.md). Os principais achados obtidos na inspeção ao vivo da aplicação incluem:

- **Funcionais / Regra de negócio:**
  - Quebra na busca, ordenação, paginação ou ações na tabela de usuários (15 registros iniciais).
  - *Achado real fora do enunciado:* exclusão de usuário (`delete-N`) ocorre **imediatamente sem diálogo de confirmação**, elevando risco de perda acidental de dados.
  - *Achado real fora do enunciado:* o campo `Bio` exibe contador `0/200`, mas **não impede nem valida** entrada acima do limite (aceitou `210/200` e permitiu cadastro com sucesso).
- **UX / Estado vazio:**
  - *Achado real fora do enunciado:* buscar um usuário inexistente deixa o `tbody` vazio sem mensagem de empty state e exibe o contador inconsistente **`"Showing 1-0 of 0 entries"`**.
- **Técnicos / Sincronização:**
  - Componentes assíncronos (`Delayed Dropdown`, ~2s) e tabelas com colunas/linhas permutadas (`Dynamic Table`) induzem flakiness quando testados com `waitForTimeout` ou índices fixos (`nth-child`).
- **Acessibilidade (WCAG 2.1 AA):**
  - Varredura real com `axe-core` detectou violações **críticas** nos controles da Tabela de Usuários (`#rowsPerPage` e `#tableFilter` sem label acessível; `#pagePrev`/`#pageNext` sem nome acessível; checkboxes de seleção sem label), além de violação **séria** `label-content-name-mismatch` na própria seção `#a11y` (`Button 1..3` com `aria-label` divergente do texto visível) e contraste insuficiente em badges/erros.
- **Responsividade:**
  - A tabela de usuários (`~706px`) em tela mobile (`390px`) depende de scroll interno no container (`overflow-x: auto`); embora não quebre o documento global, ações à direita podem ficar pouco evidentes para o usuário.

---

## 5. Estratégia de cobertura

A suíte adota uma abordagem **orientada a risco e ortogonalidade**, distribuindo **8 cenários E2E** sem sobreposição desnecessária:

| Categoria | Qtd. | Tags | Objetivo principal |
|---|---:|---|---|
| Tabela de Usuários (Positivo + Negativo) | 2 | `@smoke`, `@users`, `@negative`, `@mobile` | Proteger jornada principal CRUD/leitura/navegação e estado vazio |
| Formulário de Cadastro (Positivo + Negativo) | 2 | `@smoke`, `@forms`, `@negative`, `@mobile` | Garantir cadastro válido, reset e bloqueio de dados inválidos |
| Componentes Dinâmicos e Assíncronos | 2 | `@smoke`, `@dynamic` | Validar sincronização por estado observável e independência de posição |
| Acessibilidade (`a11y`) | 1 | `@a11y` | Validar labels, teclado, ARIA/focus trap e auditoria `axe-core` |
| Responsividade Mobile | 1 | `@mobile`, `@mobile-only` | Validar layout sem overflow, breakpoints e usabilidade em tela reduzida |
| **Total** | **8** | — | Cobertura equilibrada dentro da faixa alvo (5 a 8 testes) |

---

## 6. Critérios de priorização

Os cenários foram classificados em **P0, P1 e P2** combinando três critérios:

1. **Impacto no usuário/negócio (Alto / Médio / Baixo):** bloqueia uma jornada central ou gera perda/corrupção de dados?
2. **Probabilidade de regressão técnica:** envolve estado assíncrono, mutação de DOM, validação customizada (`novalidate`) ou adaptação de layout?
3. **Relação valor vs. custo de manutenção em E2E:** o teste entrega sinal confiável com baixo risco de flakiness?

- **P0 (`@smoke`):** fluxos críticos que bloqueiam uso principal — executam em **PRs**, **Chromium**, **WebKit** e (quando aplicável) **Mobile Safari**.
- **P1:** cenários negativos críticos, comportamentos dinâmicos complementares, acessibilidade e responsividade — executam em **Chromium** (ou **Mobile Safari** para `@mobile-only`) em todo push/PR.
- **P2:** fluxos secundários ou redundantes — documentados na matriz e mantidos fora da suíte E2E inicial.

### Frequência recomendada de execução

- **A cada Pull Request:** `@smoke` em Chromium + WebKit + Mobile Safari (feedback rápido < 2 min) e regressão completa em Chromium.
- **Merge na `main`:** suíte completa nos 3 projetos configurados (`chromium`, `webkit` smoke, `mobile-safari`).
- **Execução sob demanda (`workflow_dispatch`):** filtragem manual por projeto/navegador e por tag para investigação rápida ou validação pré-release.

---

## 7. Estratégia de automação

- **Arquitetura:** Page Object Model enxuto (`src/pages/`), injetado via **Custom Playwright Fixtures** (`src/fixtures/test.fixtures.ts`), com factories de massa fictícia (`src/data/`) e utilitários dedicados (`src/utils/`). As asserções permanecem majoritariamente nos specs para preservar legibilidade da intenção do teste.
- **Estratégia de seletores (ordem de preferência):**
  1. Seletores orientados ao usuário (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`);
  2. `getByTestId` como contrato explícito e resiliente quando o elemento carece de nome acessível adequado (como nos controles da tabela identificados na auditoria a11y);
  3. Zero XPath absoluto e zero dependência posicional frágil (`nth-child`).
- **Sincronização:** 100% baseada em auto-waiting e web-first assertions (`toBeVisible`, `toBeEnabled`, `toBeHidden`, `toHaveText`, `toHaveCount`) — **proibido `waitForTimeout`** como mecanismo de sincronização.
- **Isolamento e dados:** cada teste inicia em página limpa (`BrowserContext` isolado do Playwright), usa dados sintéticos gerados por factory e não depende da ordem de execução (`fullyParallel: true` com workers controlados: 3 local / 2 em CI).
- **Controle de flakiness:** timeouts configurados centralmente, `retries: 1` apenas no CI (0 local para expor instabilidades imediatamente durante o desenvolvimento), retenção de `trace`, `screenshot` e `video` em caso de falha, e nenhuma asserção sobre comportamento aleatório (ex.: não se exige que a Dynamic Table mude de ordem após o reload). A suíte foi validada com `--repeat-each=3` (39/39).
- **Validação das asserções:** além de passar, cada asserção crítica foi checada com mutação manual (alterar o valor esperado e confirmar que o teste falha). Isso revelou um falso positivo na ordenação ASC (a página 1 já vem em ordem alfabética), corrigido para validar a transição ASC → DESC.
- **Pipeline:** matriz por projeto calculada no job `plan` (com filtro manual por navegador e por tag), cache de dependências e navegadores, artefatos publicados mesmo com falha e relatório HTML único consolidado a partir dos relatórios `blob` de cada projeto.

---

## 8. Navegadores e resoluções

| Projeto Playwright | Motor / Dispositivo | Resolução | Escopo executado | Justificativa |
|---|---|---:|---|---|
| `chromium` | Desktop Chrome (Blink) | `1280×720` | Suíte completa (exceto `@mobile-only`) | Maior fatia de mercado desktop corporativo e melhor feedback completo |
| `webkit` | Desktop Safari (WebKit) | `1280×720` | Cenários `@smoke` (exceto `@mobile-only`) | Motor independente do Blink, captura divergências reais de layout, foco e eventos no ecossistema Apple |
| `mobile-safari` | iPhone 13 (WebKit mobile) | `390×844` | Cenários `@mobile` (críticos + layout mobile) | Resolução representativa de smartphones modernos (~390px CSS width) com toque e motor iOS Safari |

**Trade-off multi-browser:** rodar todos os testes em todos os navegadores multiplica tempo de CI e ruído sem retorno proporcional. Executar a suíte integral no Chromium e o subconjunto crítico (`@smoke` / `@mobile`) no WebKit entrega cobertura cross-engine com custo controlado.

---

## 9. Critérios de entrada e saída

### Critérios de entrada (Entry Criteria)
- Aplicação-alvo acessível em `https://playwrightlab.github.io/`.
- Dependências instaladas (`npm ci`) e navegadores Playwright provisionados (`chromium`, `webkit`).
- Compilação TypeScript estrita aprovada (`npm run typecheck`).

### Critérios de saída (Exit Criteria)
- 100% dos cenários automatizados verdes em `chromium`, `webkit` (`@smoke`) e `mobile-safari` (`@mobile`).
- Zero usos de `waitForTimeout`, `test.only` ou seletores frágeis (XPath absoluto / índices fixos).
- Relatório HTML gerado e artefatos de diagnóstico configurados na pipeline (com preservação mesmo em falha).
- Documentação estratégica, matrizes e README atualizados com os achados reais.

---

## 10. Limitações conhecidas

- **Aplicação sem persistência backend:** as alterações na Tabela de Usuários e no Formulário são mantidas em memória no cliente e resetadas ao recarregar a página; por isso, não há teste de persistência entre sessões/banco de dados.
- **Limitações da análise automatizada de acessibilidade (`axe-core`):** ferramentas automatizadas detectam tipicamente entre **30% e 50%** dos critérios WCAG (contraste, atributos ARIA, labels ausentes, landmarks). Permanecem dependentes de **validação manual**:
  - qualidade semântica do texto alternativo e das mensagens de erro;
  - experiência real com leitores de tela (VoiceOver / NVDA / JAWS);
  - coerência lógica da ordem de foco em fluxos complexos e visibilidade clara do indicador de foco (`focus-visible`);
  - compreensão cognitiva, zoom até 200% e operação com tecnologias assistivas por voz.
- **Violações pré-existentes no alvo:** como o PlayLab contém violações de contraste e acessibilidade próprias da aplicação, a auditoria automatizada é escopada por critérios críticos e anexada ao relatório para diagnóstico transparente, em vez de mascarar defeitos ou gerar falsos negativos.

---

## 11. Próximos passos

1. Expandir cobertura com **interceptação de rede (`page.route`)** na seção `#network` (simulando 200, 500 e timeout sem depender de serviço externo).
2. Adicionar **teste visual seletivo** (`toHaveScreenshot`) em componentes críticos estáveis (ex.: formulário de cadastro e modal), avaliando custo de snapshots multiplataforma em CI (Linux vs. macOS).
3. Incluir **Upload de Arquivos** (`UPL-01..03`) com fixtures estáticas seguras em `test-assets/` caso o fluxo de anexos passe a ser prioritário.
4. Adicionar projeto mobile Android (`Pixel 7`, Chromium) para os cenários `@mobile`.
5. Integrar linting estático (`ESLint` + `eslint-plugin-playwright`) como gate de qualidade na pipeline.
