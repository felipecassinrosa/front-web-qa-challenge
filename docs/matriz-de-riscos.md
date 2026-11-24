# Matriz de Riscos — PlayLab

Análise de riscos elaborada a partir da **exploração ao vivo** de `https://playwrightlab.github.io/` em desktop (`1280×720`) e mobile (`390×844`), combinando inspeção funcional, DOM, rede e auditoria automatizada com `@axe-core/playwright`.

---

## 1. Riscos Funcionais

| ID | Área / Jornada | Risco identificado | Impacto | Probabilidade | Mitigação / Ação na estratégia |
|---|---|---|---|---|---|
| RSK-F01 | Tabela de Usuários | Falha no carregamento ou estrutura corrompida de cabeçalhos impede gestão administrativa | Alto | Baixa | Coberto em `USR-E2E-01` (validação de headers e contagem inicial) |
| RSK-F02 | Tabela de Usuários | Pesquisa, ordenação ou paginação retornam dados incorretos ou fora de sincronia | Alto | Média | Coberto em `USR-E2E-01` (busca, sort ASC/DESC e navegação de página) |
| RSK-F03 | Tabela de Usuários | Ação de exclusão não remove o usuário ou não atualiza contagem total da tabela | Alto | Média | Coberto em `USR-E2E-01` (exclusão validando remoção e contador) |
| RSK-F04 | Formulário de Cadastro | Submissão válida falha em confirmar cadastro ou reset não limpa o estado preenchido | Alto | Média | Coberto em `FRM-E2E-01` |
| RSK-F05 | Formulário de Cadastro | Formulário com `novalidate` permite envio com campos obrigatórios vazios, e-mail inválido, senha < 8 chars ou termos desmarcados | Alto | Alta | Coberto em `FRM-NEG-01` |
| RSK-F06 | **Achado real (além do enunciado)** — Formulário (`Bio`) | Campo `Bio` exibe contador `0/200`, mas **não bloqueia nem valida** textos acima de 200 caracteres (aceitou `210/200` e concluiu o cadastro) | Médio | Confirmado | Documentado como defeito real de validação client-side; candidato a asserção de regressão após correção do produto |
| RSK-F07 | **Achado real (além do enunciado)** — Tabela de Usuários | Exclusão (`delete-N`) remove o registro **imediatamente sem modal/diálogo de confirmação**, elevando risco de perda acidental de dados | Alto | Confirmado | Registrado como risco de produto/UX; foi o motivo de escolher a exclusão como a ação validada em `USR-E2E-01` |

---

## 2. Riscos Técnicos

| ID | Área / Componente | Risco identificado | Impacto | Probabilidade | Mitigação / Ação na estratégia |
|---|---|---|---|---|---|
| RSK-T01 | Delayed Dropdown | Interação antes do término da carga assíncrona (~2s) ou uso de `waitForTimeout` gera flakiness no CI | Alto | Alta | Coberto em `DYN-ASYNC-01` aguardando estado observável (`loader` visível → oculto e `select` habilitado) |
| RSK-T02 | Dynamic Table | Colunas e linhas mudam de ordem a cada reload com valores aleatórios; seletores por `nth-child` ou valores fixos quebram | Alto | Alta | Coberto em `DYN-TBL-01` mapeando índices dinamicamente pelos cabeçalhos `<th>` |
| RSK-T03 | Dependência externa (`#network`) | `Fetch Users API` consulta `jsonplaceholder.typicode.com`; instabilidade externa quebraria a pipeline | Médio | Média | Mantido fora da suíte principal sem mock; recomendado com `page.route` nos próximos passos |
| RSK-T04 | Acoplamento a seletores | Alterações de CSS/estrutura quebrarem a suíte se houver dependência de classes de estilo ou XPath absoluto | Médio | Média | Hierarquia de seletores semânticos (`role`/`label`/`placeholder`) + `data-testid` como contrato explícito |

---

## 3. Riscos de Experiência do Usuário (UX) e Responsividade

| ID | Área / Dispositivo | Risco identificado | Impacto | Probabilidade | Mitigação / Ação na estratégia |
|---|---|---|---|---|---|
| RSK-U01 | **Achado real (além do enunciado)** — Busca sem resultados | Buscar usuário inexistente deixa o corpo da tabela vazio **sem mensagem de empty state** e exibe **`"Showing 1-0 of 0 entries"`** (bug off-by-one) | Médio | Confirmado | Coberto em `USR-NEG-01` validando 0 linhas e documentando o defeito observado no contador/empty state |
| RSK-U02 | Mobile (`390×844`) | Overflow horizontal global ou sobreposição de cards quebra navegação em smartphones | Alto | Média | Coberto em `RSP-MOB-01` validando `scrollWidth <= innerWidth`, menu `#hamburger` e empilhamento vertical |
| RSK-U03 | Mobile (`390×844`) — Tabela de Usuários | Tabela possui largura de `~706px` em viewport `390px`; embora contida em `overflow-x: auto`, ações à direita exigem scroll horizontal interno pouco evidente | Médio | Confirmado | Coberto em `USR-E2E-01` (`@mobile`) e em `RSP-MOB-01`, que garante que a ação de excluir é alcançável e operável em `390px`; registrado como melhoria de UX (card view mobile ou indicação de scroll) |

---

## 4. Riscos de Acessibilidade (`a11y` — WCAG 2.1 AA)

Achados comprovados via inspeção de DOM e execução do `@axe-core/playwright` em `https://playwrightlab.github.io/`:

| ID | Área / Regra WCAG | Defeito / Risco identificado | Severidade (axe) | Mitigação / Ação na estratégia |
|---|---|---|---|---|
| RSK-A01 | Tabela de Usuários (`select-name`) | Selects `#rowsPerPage` e `#tableFilter` não possuem `<label>` nem `aria-label` | **Crítica** | Documentado como achado real; explica também o uso de `data-testid` nesses controles |
| RSK-A02 | Tabela de Usuários (`label` / `button-name`) | Checkboxes `#selectAll` / `row-check-N` sem label acessível; botões `#pagePrev`, `#pageNext` e ações de ícone sem texto discernível | **Crítica** | Documentado como achado real de barreira para leitores de tela |
| RSK-A03 | **Achado real (além do enunciado)** — Seção `#a11y` (`label-content-name-mismatch`) | Botões `a11y-btn-1..3` exibem `"Button 1..3"`, mas têm `aria-label="First/Second/Third action button"`, violando WCAG 2.5.3 (comando de voz) | **Séria** | Registrado na matriz e anexado como evidência não bloqueante (`axe-full-page.json` + anotação) em `A11Y-01` |
| RSK-A04 | Seção `#a11y` / diálogo com foco preso | Falha no aprisionamento ou na saída de foco do diálogo (ex.: `Escape` não fecha, foco não volta ao botão de origem) bloqueia quem usa só teclado | Alta | Coberto em `A11Y-01` (diálogo operado só por teclado: ordem e ciclo de foco, `Escape` e retorno do foco) |
| RSK-A05 | Formulário de Cadastro | Perda de associação `<label for>` ou regressão estrutural crítica nos campos obrigatórios | Alta | Coberto em `A11Y-01` por checagem explícita de labels — o axe sozinho não basta: ele aceita o `placeholder` como nome acessível e não acusou um label quebrado no teste de mutação — mais a varredura `axe-core` sem violações críticas no formulário |
| RSK-A06 | Global (`color-contrast`, `landmark-one-main`, `heading-order`) | Contraste insuficiente em badges/mensagens de erro, ausência de landmark `<main>` e salto de heading `H2 → H4` em Shopping | **Séria / Moderada** | Registrado como evidência não bloqueante em `A11Y-01`: a auditoria da página inteira (`axe-full-page.json`) inclui as regras WCAG e as *best-practice*, onde ficam `landmark-one-main` e `heading-order` |
| RSK-A07 | **Achado real (além do enunciado)** — Tabela de Usuários (`scrollable-region-focusable`) | O container com scroll horizontal da tabela não é focável por teclado: em telas estreitas, quem navega só por teclado não consegue rolar até as colunas da direita | **Séria** | Detectado pela auditoria da página inteira em `A11Y-01`; relacionado a `RSK-U03` |
| RSK-A08 | **Achado real (além do enunciado)** — Menu hambúrguer (mobile) | O botão `Toggle menu` abre e fecha a navegação, mas não expõe `aria-expanded`; leitores de tela não anunciam se o menu está aberto | Moderada | Observado na execução de `RSP-MOB-01` (o teste valida o comportamento visual do menu); candidato a asserção quando corrigido |
