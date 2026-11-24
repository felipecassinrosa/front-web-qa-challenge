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
- **Acessibilidade (`a11y`):** associação de labels no formulário, operação por teclado de um diálogo (`role="dialog"` com foco preso) e análise automatizada via `@axe-core/playwright`.
- **Responsividade (Mobile):** validação em viewport mobile (`iPhone 13 — 390×844`) garantindo ausência de overflow horizontal global, menu responsivo, empilhamento de layout e operação da jornada crítica em tela reduzida.
- **Compatibilidade entre navegadores:** estratégia multi-engine combinando **Chromium** e **WebKit**.
- **Execução contínua e diagnóstico:** pipeline GitHub Actions com relatório HTML consolidado, prints de evidência em todo teste, logs do navegador, traces e, em falha, vídeos.

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

O enunciado pede de 5 a 8 testes e deixa claro que não é para automatizar tudo, e sim os cenários principais, escolhidos por risco, valor e custo de manutenção. A seleção seguiu três filtros, nesta ordem.

### 5.1 Filtro 1 — Itens obrigatórios do enunciado (núcleo: 5 testes)

Cada item obrigatório é atendido pelo cenário de maior risco da sua categoria:

| Item obrigatório | Teste | Por que este |
|---|---|---|
| Jornada principal da tabela de usuários | `USR-E2E-01` (P0) | Segue a jornada do enunciado em um único fluxo; a ação validada é a exclusão, a de maior impacto (remove sem confirmação, RSK-F07) |
| Cenário de formulário | `FRM-E2E-01` (P0) | O cadastro válido é o caminho que o usuário precisa concluir; o reset entra junto porque parte do mesmo estado (formulário preenchido) |
| Cenário negativo | `FRM-NEG-01` (P0) | Entre os negativos, é o de maior probabilidade de regressão: o formulário usa `novalidate`, então toda a proteção depende do JavaScript da página |
| Componente dinâmico ou assíncrono | `DYN-ASYNC-01` (P0) | Carregamento com atraso é a principal fonte de testes instáveis; prova a sincronização por estado observável, sem espera fixa |
| Validação de acessibilidade | `A11Y-01` (P1) | Cobre os riscos de maior impacto para quem usa teclado ou leitor de tela: labels do formulário e armadilha de foco em diálogo, mais a auditoria automatizada |
| Execução em resolução mobile | `USR-E2E-01` e `FRM-E2E-01` no iPhone 13 | Não exigiu teste novo: as jornadas P0 rodam também no projeto `mobile-safari` |

### 5.2 Filtro 2 — Maior risco que sobra, com baixo custo (3 complementares)

Com o núcleo em 5 testes, as 3 vagas restantes da faixa foram para riscos que o núcleo não pega:

| Teste | Risco que o núcleo não cobre |
|---|---|
| `USR-NEG-01` (P1) | Estado vazio da busca, onde foi encontrado um defeito real (`Showing 1-0 of 0 entries`, sem mensagem de estado vazio). Custo baixo: um campo e poucas asserções |
| `DYN-TBL-01` (P1) | Tabela com colunas e linhas que mudam a cada carga: o maior risco técnico de seletor frágil. Mostra a leitura pelo cabeçalho, sem índice fixo nem valor sorteado |
| `RSP-MOB-01` (P1) | Rodar a jornada no iPhone não detecta scroll horizontal, sobreposição nem menu quebrado; este teste valida o layout e o acesso às ações em tela pequena |

**Se a suíte precisasse diminuir**, os 5 do núcleo são o mínimo que atende o enunciado; os 3 complementares são os primeiros a sair.

### 5.3 Filtro 3 — O que ficou de fora

Todo cenário de referência do enunciado tem uma decisão registrada na [matriz de cenários](./matriz-de-cenarios.md#2-rastreabilidade-dos-cenários-de-referência-do-enunciado): qual teste o cobre ou por que não foi automatizado. Os motivos mais comuns:

- **Opcional e fora das jornadas administrativas:** upload, drag and drop, hover, iframes, Shadow DOM.
- **Regra garantida pelo próprio HTML:** opção `disabled`, `maxlength` — o risco está na marcação e pertence a teste de componente.
- **Defeito conhecido:** o limite do Bio (aceita `210/200`); automatizar agora geraria um teste sempre vermelho ou um teste que aprova o defeito.
- **Dependência externa:** a API pública da seção Network deixaria a pipeline instável.
- **Validação humana:** leitor de tela, zoom e clareza das mensagens.

### 5.4 Escopo dentro de cada teste

Cada teste valida o comportamento principal, não todas as variações: a busca usa um usuário existente, não todas as combinações; a ordenação valida a coluna Name, não todas as colunas (todas usam a mesma função de comparação no código da app); o formulário valida um cadastro válido e duas combinações inválidas, não todas as regras de cada campo — isso pertence a teste unitário ou de componente.

### 5.5 Distribuição

| Categoria | Qtd. | Testes | Tags |
|---|---:|---|---|
| Tabela de Usuários | 2 | `USR-E2E-01` (núcleo), `USR-NEG-01` (complementar) | `@smoke`, `@users`, `@negative`, `@mobile` |
| Formulário de Cadastro | 2 | `FRM-E2E-01`, `FRM-NEG-01` (núcleo) | `@smoke`, `@forms`, `@negative`, `@mobile` |
| Componentes Dinâmicos e Assíncronos | 2 | `DYN-ASYNC-01` (núcleo), `DYN-TBL-01` (complementar) | `@smoke`, `@dynamic` |
| Acessibilidade | 1 | `A11Y-01` (núcleo) | `@a11y` |
| Responsividade Mobile | 1 | `RSP-MOB-01` (complementar) | `@mobile`, `@mobile-only` |
| **Total** | **8** | 5 núcleo + 3 complementares | — |

---

## 6. Critérios de priorização

Os cenários foram classificados em **P0, P1 e P2** combinando três critérios:

1. **Impacto no usuário/negócio (Alto / Médio / Baixo):** bloqueia uma jornada central ou gera perda/corrupção de dados?
2. **Probabilidade de regressão técnica:** envolve estado assíncrono, mutação de DOM, validação customizada (`novalidate`) ou adaptação de layout?
3. **Relação valor vs. custo de manutenção em E2E:** o teste entrega sinal confiável com baixo risco de flakiness?

- **P0:** a falha bloqueia a jornada principal ou deixa passar dado inválido — `USR-E2E-01`, `FRM-E2E-01`, `FRM-NEG-01`, `DYN-ASYNC-01`. Os três caminhos felizes P0 têm a tag `@smoke` e rodam também no WebKit; `FRM-NEG-01` roda só no Chromium, porque a validação é JavaScript da própria página e não depende do motor de renderização.
- **P1:** risco relevante que não bloqueia a jornada principal — `USR-NEG-01`, `DYN-TBL-01`, `A11Y-01`, `RSP-MOB-01`. Rodam no Chromium (ou no iPhone 13, no caso de `@mobile-only`).
- **P2:** secundários ou redundantes — documentados na matriz e mantidos fora da suíte.

Prioridade (risco) e obrigatoriedade são coisas diferentes: `A11Y-01` é P1 pelo risco atual, mas está no núcleo porque o enunciado exige uma validação de acessibilidade.

### Frequência recomendada de execução

- **Cada push e pull request na `main`:** os 3 projetos em paralelo (Chromium com a suíte completa, WebKit com `@smoke`, iPhone 13 com `@mobile`) — cerca de 2 minutos de pipeline.
- **Sob demanda (`workflow_dispatch`):** filtro por navegador e por tag, para investigar uma falha ou validar antes de uma entrega.
- **Recomendado num produto real:** execução diária agendada contra o ambiente de homologação. Não foi configurada aqui para não gerar execuções recorrentes contra uma aplicação de terceiros (restrição da seção 15).

---

## 7. Estratégia de automação

- **Arquitetura:** Page Object Model enxuto (`src/pages/`), injetado via **Custom Playwright Fixtures** (`src/fixtures/test.fixtures.ts`), com factories de massa fictícia (`src/data/`) e utilitários dedicados (`src/utils/`). As asserções permanecem majoritariamente nos specs para preservar legibilidade da intenção do teste.
- **Estratégia de seletores (ordem de preferência):**
  1. Seletores orientados ao usuário (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`);
  2. `getByTestId` como contrato explícito e resiliente quando o elemento carece de nome acessível adequado (como nos controles da tabela identificados na auditoria a11y);
  3. Zero XPath absoluto e zero dependência posicional frágil (`nth-child`).
- **Sincronização:** 100% baseada em auto-waiting e web-first assertions (`toBeVisible`, `toBeEnabled`, `toBeHidden`, `toHaveText`, `toHaveCount`) — **proibido `waitForTimeout`** como mecanismo de sincronização.
- **Isolamento e dados:** cada teste inicia em página limpa (`BrowserContext` isolado do Playwright), usa dados sintéticos gerados por factory e não depende da ordem de execução (`fullyParallel: true` com workers controlados: 3 local / 2 em CI).
- **Controle de flakiness:** timeouts configurados centralmente, `retries: 1` apenas no CI (0 local para expor instabilidades imediatamente durante o desenvolvimento) e nenhuma asserção sobre comportamento aleatório (ex.: não se exige que a Dynamic Table mude de ordem após o reload). A suíte foi validada com `--repeat-each=3` (39/39).
- **Evidências:** cada teste anexa ao relatório um print do estado final validado (ex.: tabela após a exclusão, mensagem de sucesso, menu mobile aberto); a config tira um screenshot ao fim de todo teste; uma fixture automática anexa os logs do navegador (erros de console, exceções e requisições com falha); o CI grava trace de todos os testes; vídeo só em falha, por ser o artefato mais pesado.
- **Validação das asserções:** além de passar, cada asserção crítica foi checada com mutação manual (alterar o valor esperado ou a página e confirmar que o teste falha). Isso revelou um falso positivo na ordenação ASC (a página 1 já vem em ordem alfabética), corrigido para validar a transição ASC → DESC, e mostrou que o axe não detecta label quebrado em campo com placeholder — por isso a checagem explícita de labels ficou no `A11Y-01`.
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
- Relatório HTML consolidado publicado na pipeline, com prints de evidência, logs do navegador e traces de todos os testes.
- Documentação estratégica, matrizes e README atualizados com os achados reais.

---

## 10. Limitações conhecidas

- **Aplicação sem persistência backend:** as alterações na Tabela de Usuários e no Formulário são mantidas em memória no cliente e resetadas ao recarregar a página; por isso, não há teste de persistência entre sessões/banco de dados.
- **Limitações da análise automatizada de acessibilidade (`axe-core`):** ferramentas automatizadas detectam tipicamente entre **30% e 50%** dos critérios WCAG (contraste, atributos ARIA, labels ausentes, landmarks). Permanecem dependentes de **validação manual**:
  - qualidade semântica do texto alternativo e das mensagens de erro;
  - experiência real com leitores de tela (VoiceOver / NVDA / JAWS);
  - coerência lógica da ordem de foco em fluxos complexos e visibilidade clara do indicador de foco (`focus-visible`);
  - compreensão cognitiva, zoom até 200% e operação com tecnologias assistivas por voz.
- **O axe aceita placeholder como nome acessível:** removendo o `for` do label de e-mail, a auditoria continuou sem violações, porque o campo tem `placeholder`. Por isso a associação de labels é verificada explicitamente no `A11Y-01`, e não só pelo axe.
- **Violações pré-existentes no alvo:** como o PlayLab contém violações de contraste e acessibilidade próprias da aplicação, a auditoria automatizada é escopada por critérios críticos e anexada ao relatório para diagnóstico transparente, em vez de mascarar defeitos ou gerar falsos negativos.

---

## 11. Próximos passos

1. Expandir cobertura com **interceptação de rede (`page.route`)** na seção `#network` (simulando 200, 500 e timeout sem depender de serviço externo).
2. Adicionar **teste visual seletivo** (`toHaveScreenshot`) em componentes críticos estáveis (ex.: formulário de cadastro e modal), avaliando custo de snapshots multiplataforma em CI (Linux vs. macOS).
3. Incluir **Upload de Arquivos** (`UPL-01..03`) com fixtures estáticas seguras em `test-assets/` caso o fluxo de anexos passe a ser prioritário.
4. Adicionar projeto mobile Android (`Pixel 7`, Chromium) para os cenários `@mobile`.
5. Integrar linting estático (`ESLint` + `eslint-plugin-playwright`) como gate de qualidade na pipeline.
