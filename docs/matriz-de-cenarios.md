# Matriz de Cenários — PlayLab

O enunciado pede de 5 a 8 testes, escolhidos pelos cenários principais, e não a automação de tudo. Esta matriz mostra:

1. os **8 testes automatizados**, divididos entre o **núcleo** (5 testes que atendem os itens obrigatórios do enunciado) e os **complementares** (3 testes para os maiores riscos que sobram);
2. a **rastreabilidade de todos os cenários de referência do enunciado**: qual teste cobre cada um ou por que ficou de fora;
3. outros cenários analisados na aplicação que não constam do enunciado.

O raciocínio completo da seleção está em [estrategia-de-testes.md, seção 5](./estrategia-de-testes.md#5-estratégia-de-cobertura).

## Legenda

- **Núcleo:** atende um item obrigatório do enunciado. É o mínimo da suíte; não sai.
- **Complementar:** protege um risco relevante que o núcleo não cobre. São os primeiros candidatos a sair se a suíte precisar diminuir.
- **Status:** `Implementado` (automatizado e passando nos 3 projetos), `Coberto em <teste>`, `Parcial`, `Evidência` (registrado no relatório, sem bloquear) ou `Não automatizado`.

---

## 1. Testes automatizados (8)

| ID | Jornada | Descrição | Tipo de teste | Risco protegido | Prioridade | Automatizar? | Justificativa | Status |
|---|---|---|---|---|---|---|---|---|
| USR-E2E-01 | Tabela de Usuários | Carregamento (5 de 15 usuários), cabeçalhos, busca por `Alice Johnson` com e-mail, papel e situação validados por coluna, paginação (página 2), ordenação por nome (transição ASC → DESC e ordem dos 15 registros) e exclusão com atualização da contagem | Funcional / E2E (`@smoke`, `@users`, `@mobile`) | RSK-F01, RSK-F02, RSK-F03, RSK-F07 | P0 | **Sim** | **Núcleo** — jornada principal obrigatória. Um único fluxo segue a jornada do enunciado; a exclusão foi a ação escolhida por ter o maior impacto (remove sem confirmação). Roda também no iPhone 13, o que atende a execução mobile obrigatória | Implementado |
| FRM-E2E-01 | Formulário de Cadastro | Preencher e aplicar reset (todos os campos e o contador do Bio voltam ao estado inicial); preencher com dados da factory, submeter e validar a mensagem de sucesso | Funcional / E2E (`@smoke`, `@forms`, `@mobile`) | RSK-F04 | P0 | **Sim** | **Núcleo** — cenário de formulário obrigatório. O cadastro válido é o caminho que o usuário precisa concluir; o reset entra no mesmo teste porque parte do mesmo estado (formulário preenchido) | Implementado |
| FRM-NEG-01 | Formulário de Cadastro | Submeter vazio e validar as 4 mensagens de obrigatoriedade; corrigir só o nome e manter e-mail malformado, senha curta e termos desmarcados, validando que só o erro corrigido some e a submissão continua bloqueada | Negativo / Validação (`@forms`, `@negative`) | RSK-F05 | P0 | **Sim** | **Núcleo** — cenário negativo obrigatório. Entre os negativos, é o de maior probabilidade de regressão: o formulário usa `novalidate`, então toda a proteção depende do JavaScript da página | Implementado |
| DYN-ASYNC-01 | Componentes Dinâmicos | Estado inicial desabilitado; acionar o `Delayed Dropdown`, validar loading e botão desabilitado contra múltiplos cliques, aguardar a habilitação do `<select>` sem espera fixa, validar as 5 opções carregadas e selecionar uma | Assíncrono / Sincronização (`@smoke`, `@dynamic`) | RSK-T01 | P0 | **Sim** | **Núcleo** — componente assíncrono obrigatório. O carregamento com atraso (~2 s) é a principal fonte de testes instáveis; o teste prova a sincronização por estado observável | Implementado |
| A11Y-01 | Acessibilidade | Associação `<label>` ↔ campo no formulário; auditoria `axe-core` sem violações críticas no formulário; auditoria da página inteira anexada como evidência; diálogo operado só por teclado (ordem de foco, ciclo e saída com `Escape` devolvendo o foco ao botão de origem) | Acessibilidade (`@a11y`) | RSK-A04, RSK-A05 (e evidência de RSK-A01..A07) | P1 | **Sim** | **Núcleo** — validação de acessibilidade obrigatória. Cobre os dois riscos de maior impacto para quem usa teclado ou leitor de tela: labels do formulário e armadilha de foco em diálogo. A checagem explícita de labels é necessária porque o axe não detecta label quebrado em campo com placeholder | Implementado |
| USR-NEG-01 | Tabela de Usuários | Pesquisar usuário inexistente, validar 0 linhas e contador `of 0 entries`; limpar a busca e validar que a listagem volta | Negativo / Funcional (`@users`, `@negative`) | RSK-U01 | P1 | **Sim** | **Complementar** — estado vazio da busca, onde foi encontrado um defeito real (`Showing 1-0 of 0 entries`, sem mensagem de estado vazio). Custo baixo | Implementado |
| DYN-TBL-01 | Componentes Dinâmicos | Ler a `Dynamic Table` pelos cabeçalhos, antes e depois de `page.reload()`, e validar as regras estáveis (fruta → cor/estação, formatos e faixas de peso, preço e estoque) sem depender da posição nem dos valores sorteados | Dinâmico / Resiliência (`@dynamic`) | RSK-T02 | P1 | **Sim** | **Complementar** — o maior risco técnico de seletor frágil (colunas e linhas mudam a cada carga). O `DYN-ASYNC-01` não cobre esse tipo de variação | Implementado |
| RSP-MOB-01 | Responsividade Mobile | Em `iPhone 13 (390×844)`: sem scroll horizontal, menu hambúrguer abre e fecha, breakpoint `MOBILE`, visibilidade condicional, cards empilhados sem sobreposição e botão de excluir da tabela alcançável | Responsividade / Layout (`@mobile`, `@mobile-only`) | RSK-U02, RSK-U03 | P1 | **Sim** | **Complementar** — rodar a jornada no iPhone não detecta scroll horizontal, sobreposição nem menu quebrado; este teste valida o layout e o acesso às ações em tela pequena | Implementado |

---

## 2. Rastreabilidade dos cenários de referência do enunciado

Cada cenário listado no enunciado, com a decisão tomada. Os cenários foram agrupados em poucos testes quando partem do mesmo estado inicial (por exemplo, toda a jornada da tabela em `USR-E2E-01`), o que mantém a suíte pequena sem perder cobertura.

### 2.1 Tabela de usuários (seção 4)

| ID | Cenário | Prioridade | Automatizado? | Teste / justificativa |
|---|---|---|---|---|
| USR-01 | Carregamento da tabela | P0 | Sim | `USR-E2E-01` — 5 linhas e `Showing 1-5 of 15 entries` |
| USR-02 | Estrutura e cabeçalhos | P0 | Sim | `USR-E2E-01` — lista exata de cabeçalhos |
| USR-03 | Localizar usuário existente | P0 | Sim | `USR-E2E-01` — busca por `Alice Johnson` |
| USR-04 | Usuário inexistente | P1 | Sim | `USR-NEG-01` |
| USR-05 | Ordenar por uma coluna | P0 | Sim | `USR-E2E-01` — coluna Name. Todas as colunas passam pela mesma função de comparação do app; testar uma basta |
| USR-06 | Navegar entre páginas | P0 | Sim | `USR-E2E-01` — página 2 e volta para a 1 |
| USR-07 | Situação do usuário | P0 | Sim | `USR-E2E-01` — `Status` exato (`active`) na coluna. Sem teste dedicado para cada badge: agregaria pouco frente ao limite de 8 testes |
| USR-08 | Executar e validar uma ação | P0 | Sim | `USR-E2E-01` — exclusão, a ação de maior impacto (remove sem confirmação, RSK-F07). Editar e `+ Add User` ficaram fora (seção 3) |

### 2.2 Formulário (seção 5.1)

| ID | Cenário | Prioridade | Automatizado? | Teste / justificativa |
|---|---|---|---|---|
| FRM-01 | Dados válidos | P0 | Sim | `FRM-E2E-01` |
| FRM-02 | Campos obrigatórios vazios | P0 | Sim | `FRM-NEG-01` |
| FRM-03 | E-mail inválido | P0 | Sim | `FRM-NEG-01` |
| FRM-04 | Limite de caracteres | P2 | Não | Defeito conhecido: o Bio aceita `210/200` e cadastra (RSK-F06). Automatizar hoje geraria um teste sempre vermelho ou um teste que aprova o defeito. Vira gate depois da correção, de preferência como teste de componente. O Full Name tem `maxlength="50"`, regra garantida pelo próprio navegador |
| FRM-05 | Reset do formulário | P0 | Sim | `FRM-E2E-01` |
| FRM-06 | Mensagens de erro | P0 | Sim | `FRM-NEG-01` — texto exato de cada mensagem |
| FRM-07 | Associação campos ↔ labels | P1 | Sim | `A11Y-01` — checagem explícita (o axe não pega label quebrado quando há placeholder) |
| FRM-08 | Operação por teclado | P2 | Não | Os campos são controles nativos (`input`, `select`, `checkbox`), que já têm suporte de teclado do navegador. O risco de teclado está nos componentes customizados, como o diálogo coberto em `A11Y-01`. Recomendado como checagem manual |

### 2.3 Componentes dinâmicos e assíncronos (seção 5.2)

| ID | Cenário | Prioridade | Automatizado? | Teste / justificativa |
|---|---|---|---|---|
| DYN-01 | Aguardar dropdown assíncrono | P0 | Sim | `DYN-ASYNC-01` |
| DYN-02 | Selecionar opção carregada | P0 | Sim | `DYN-ASYNC-01` |
| DYN-03 | Colunas que mudam de posição | P1 | Sim | `DYN-TBL-01` |
| DYN-04 | Comportamento após recarregar | P1 | Sim | `DYN-TBL-01` — `page.reload()` |
| DYN-05 | Dados dinâmicos sem valores fixos | P1 | Sim | `DYN-TBL-01` — valida regras e faixas, não os valores sorteados |
| DYN-06 | Múltiplos cliques | P0 | Sim | `DYN-ASYNC-01` — o botão fica desabilitado durante a carga |
| DYN-07 | Estado de carregamento | P0 | Sim | `DYN-ASYNC-01` — `Loading options...` visível e depois oculto |
| DYN-08 | Opção indisponível | P2 | Não | Na app, os planos `Sold Out` e `Coming Soon` usam o atributo `disabled` nativo do `<option>`: o próprio navegador impede a seleção. O risco (alguém remover o atributo) é melhor coberto por teste de componente |

### 2.4 Upload, interações, acessibilidade e responsividade (seções 5.3 a 5.6)

| ID | Cenário | Prioridade | Automatizado? | Teste / justificativa |
|---|---|---|---|---|
| UPL-01..05 | Upload de arquivo | P2 | Não | Opcional no enunciado e fora das jornadas administrativas priorizadas |
| — | Drag and drop, hover, menu de contexto, iframes, Shadow DOM | P2 | Não | Widgets de demonstração, fora das jornadas administrativas; custo de manutenção alto sem risco de negócio identificado |
| — | Modais | P1 | Parcial | O diálogo com foco preso (`role="dialog"`, `aria-modal`) é coberto em `A11Y-01`; a seção *Modals & Alerts* ficou fora |
| A11Y-01 | Nomes acessíveis dos principais controles | P1 | Evidência | A auditoria da página inteira em `A11Y-01` registra `button-name` e `select-name` sem bloquear: a tabela de usuários já tem essas violações (RSK-A01/A02). Vira gate quando o produto corrigir |
| A11Y-02 | Labels do formulário | P1 | Sim | `A11Y-01` |
| A11Y-03 | Navegação por teclado | P1 | Sim | `A11Y-01` — diálogo operado só com Enter, Tab, Shift+Tab e Escape |
| A11Y-04 | Ordem de foco | P1 | Sim | `A11Y-01` — campo → Action → Close Trap → volta ao campo |
| A11Y-05 | Hierarquia de títulos | P2 | Evidência | Registrado na auditoria da página inteira (`heading-order`, regra *best-practice*), sem bloquear: já existe salto H2 → H4 na seção Shopping (RSK-A06) |
| A11Y-06 | Análise automatizada | P1 | Sim | `A11Y-01` — axe-core no formulário (bloqueia em violação crítica) e na página inteira (evidência) |
| A11Y-07 | Modal sem armadilha de teclado | P1 | Sim | `A11Y-01` — Escape fecha o diálogo e devolve o foco ao botão de origem |
| RSP-01 | Jornada crítica em desktop | P0 | Sim | `USR-E2E-01`, `FRM-E2E-01` e `DYN-ASYNC-01` em `chromium` e `webkit` (1280×720) |
| RSP-02 | Jornada crítica em mobile | P0 | Sim | `USR-E2E-01` e `FRM-E2E-01` no `mobile-safari` (iPhone 13) |
| RSP-03 | Sem sobreposição relevante | P1 | Sim | `RSP-MOB-01` — cards empilhados, sem se sobrepor |
| RSP-04 | Sem scroll horizontal indevido | P1 | Sim | `RSP-MOB-01` |
| RSP-05 | Acesso às ações em tela reduzida | P1 | Sim | `RSP-MOB-01` — menu hambúrguer e botão de excluir da tabela |

Compatibilidade entre navegadores (seção 5.7): Chromium com a suíte completa, WebKit desktop com `@smoke` e WebKit mobile com `@mobile`. Justificativa em [estrategia-de-testes.md, seção 8](./estrategia-de-testes.md#8-navegadores-e-resoluções).

---

## 3. Outros cenários analisados (fora da lista do enunciado)

| ID | Jornada | Descrição | Tipo de teste | Risco protegido | Prioridade | Automatizar? | Justificativa | Status |
|---|---|---|---|---|---|---|---|---|
| USR-FLT | Tabela de Usuários | Filtrar por papel (`All Roles` / `Admin` / ...) | Funcional | RSK-F02 | P2 | **Não** | A jornada pede "pesquisar, filtrar **ou** localizar"; a busca já cobre a localização, e no código da app o filtro por papel é aplicado no mesmo trecho que a busca | Não automatizado |
| USR-EDT | Tabela de Usuários | Editar usuário e adicionar usuário (`+ Add User`) | Funcional | RSK-F03 | P2 | **Não** | A exclusão foi escolhida como a ação a validar por ter o maior impacto; edição e inclusão ficam como próxima expansão | Não automatizado |
| NET-01 | Network & API | `Fetch Users API` contra `jsonplaceholder.typicode.com` real | Integração / Rede | RSK-T03 | P2 | **Não** | Dependência de serviço público de terceiros deixaria a pipeline instável; recomendado com `page.route` (resposta simulada) | Não automatizado |
| SHP-01 | Shopping / Checkout | Adicionar produtos ao carrinho e finalizar checkout | E2E | Fluxo de e-commerce | P2 | **Não** | Fora do contexto do enunciado (plataforma administrativa centrada em usuários, formulários e componentes dinâmicos) | Não automatizado |
| A11Y-MANUAL | Acessibilidade | Leitor de tela (VoiceOver/NVDA), zoom 200% e clareza das mensagens | Acessibilidade manual | Experiência assistiva real | P1 | **Não** | Ferramentas automatizadas não substituem validação humana com tecnologia assistiva | Não automatizado (manual) |
| PERF-01 | Carga / Segurança | Execução concorrente massiva ou varredura de segurança | Não funcional | Disponibilidade / AppSec | N/A | **Não** | Proibido pelas restrições do enunciado (seção 15) | Não automatizado |
