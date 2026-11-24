# Matriz de Cenários — PlayLab

Seleção baseada em risco, valor de negócio e custo de manutenção. Dos cenários analisados abaixo, **8 foram selecionados para automação E2E** (faixa definida no desafio: 5 a 8 testes), garantindo cobertura completa de todos os requisitos obrigatórios sem inflar o custo de manutenção.

## Legenda de Status
- **Implementado:** cenário automatizado e validado na suíte base.
- **Planejado:** cenário especificado na estratégia e pronto para implementação incremental sobre a arquitetura base.
- **Não automatizado:** cenário conscientemente mantido fora da suíte E2E inicial (justificativa na coluna correspondente).

---

## 1. Cenários selecionados para automação (8 testes)

| ID | Jornada | Descrição | Tipo de teste | Risco protegido | Prioridade | Automatizar? | Justificativa | Status |
|---|---|---|---|---|---|---|---|---|
| USR-E2E-01 | Tabela de Usuários | Validar carregamento inicial (15 usuários, 5 por página), cabeçalhos, busca por usuário existente (`Alice Johnson`), ordenação por nome (ASC/DESC), paginação (página 2) e exclusão de usuário com atualização da contagem (`14 entries`) | Funcional / E2E (`@smoke`, `@users`, `@mobile`) | RSK-F01, RSK-F02, RSK-F03, RSK-U03 | P0 | **Sim** | Protege a jornada principal obrigatória ponta a ponta em um fluxo coeso, rápido e de alto valor; executado em Chromium, WebKit e Mobile Safari | Implementado |
| USR-NEG-01 | Tabela de Usuários | Pesquisar por um usuário inexistente e validar que nenhuma linha é exibida na tabela, mantendo os controles íntegros (registrando o achado de UX no contador `Showing 1-0 of 0 entries`) | Negativo / Funcional (`@users`, `@negative`) | RSK-U01 | P1 | **Sim** | Garante comportamento previsível em buscas sem retorno (cenário negativo obrigatório) e protege contra regressões de renderização em estado vazio | Implementado |
| FRM-E2E-01 | Formulário de Cadastro | Preencher o Registration Form com dados fictícios válidos gerados por factory, submeter, validar mensagem de sucesso (`Registration successful! Welcome aboard.`) e validar o reset do formulário | Funcional / E2E (`@smoke`, `@forms`, `@mobile`) | RSK-F04 | P0 | **Sim** | Valida o fluxo feliz crítico de cadastro e limpeza de estado com dados controlados e isolados | Planejado |
| FRM-NEG-01 | Formulário de Cadastro | Submeter o formulário vazio e com dados inválidos (e-mail malformado, senha < 8 caracteres, termos não aceitos), validando mensagens de erro específicas e bloqueio da submissão | Negativo / Validação (`@forms`, `@negative`) | RSK-F05 | P0 | **Sim** | Como o formulário usa `novalidate`, toda proteção depende da validação JS customizada — alto risco funcional de regressão | Planejado |
| DYN-ASYNC-01 | Componentes Dinâmicos | Acionar o `Delayed Dropdown`, observar o estado de carregamento (`Loading options...`), aguardar a habilitação do `<select>` sem `waitForTimeout`, selecionar uma categoria carregada e validar o resultado exibido | Assíncrono / Sincronização (`@smoke`, `@dynamic`) | RSK-T01 | P0 | **Sim** | Demonstra sincronização orientada a estado observável em carregamento assíncrono (~2s) sem esperas fixas | Planejado |
| DYN-TBL-01 | Componentes Dinâmicos | Validar integridade estrutural e leitura de dados da `Dynamic Table` (`#dynamicFruitTable`) antes e após `page.reload()`, mapeando colunas dinamicamente pelos cabeçalhos mesmo com permutação de colunas e linhas | Dinâmico / Resiliência (`@dynamic`) | RSK-T02 | P1 | **Sim** | Comprova baixo acoplamento ao DOM e validação de dados variáveis sem depender de índices fixos ou valores estáticos | Planejado |
| A11Y-01 | Acessibilidade | Validar associação `<label>`/`<input>` no Registration Form, navegação por teclado + `aria-expanded` + abertura/fechamento do Focus Trap na seção `#a11y`, e executar varredura `@axe-core/playwright` (zero violações críticas no formulário + anexo de relatório completo) | Acessibilidade (`@a11y`) | RSK-A04, RSK-A05, RSK-A01..A03 | P1 | **Sim** | Combina validação semântica/teclado (que automação pura não cobre sozinha) com auditoria automatizada `axe-core` e evidência anexada | Planejado |
| RSP-MOB-01 | Responsividade Mobile | Em resolução `iPhone 13 (390×844)`, validar ausência de overflow horizontal global, visibilidade do menu `#hamburger`, atualização do indicador de breakpoint (`MOBILE`), visibilidade condicional (`mobile-only` vs `desktop-only`) e empilhamento vertical dos cards responsivos | Responsividade / Layout (`@mobile`, `@mobile-only`) | RSK-U02, RSK-U03 | P1 | **Sim** | Protege contra quebras estruturais de layout mobile além da execução funcional da jornada principal em `mobile-safari` | Planejado |

---

## 2. Cenários analisados e NÃO automatizados nesta fase

| ID | Jornada | Descrição | Tipo de teste | Risco protegido | Prioridade | Automatizar? | Justificativa | Status |
|---|---|---|---|---|---|---|---|---|
| USR-07 | Tabela de Usuários | Validar badge de situação (`active`, `inactive`, `pending`) isoladamente em teste dedicado | Funcional | RSK-F01 | P2 | **Não** | Cobertura já indiretamente protegida na leitura de linhas em `USR-E2E-01`; um teste isolado agregaria pouco valor frente ao limite de 5–8 testes | Não automatizado |
| FRM-04 | Formulário de Cadastro | Validar bloqueio do limite de 200 caracteres no campo `Bio` | Funcional / Limite | RSK-F06 | P2 | **Não** | Na inspeção ao vivo constatou-se que a aplicação **não bloqueia** acima de 200 chars (`210/200` submete normalmente); registrado como defeito real a corrigir antes de virar gate de regressão, além de ser ideal para teste unitário/componente | Não automatizado |
| UPL-01..05 | Upload de Arquivos | Upload de arquivo válido, extensão inválida e limite de 5MB | Funcional | Validação de anexo | P2 | **Não** | Escopo opcional no enunciado; priorizamos os requisitos obrigatórios para manter a suíte focada em 8 testes de altíssimo sinal | Não automatizado |
| INT-DND / HOVER | Interações Avançadas | Drag and Drop, Hover, Context Menu, Shadow DOM e iFrames | Interação UI | Quebra de widgets secundários | P2 | **Não** | Widgets secundários de demonstração fora da jornada administrativa principal; maior custo de manutenção sem prioridade imediata | Não automatizado |
| NET-01 | Network & API | Chamar `Fetch Users API` contra `jsonplaceholder.typicode.com` real | Integração / Rede | RSK-T03 | P2 | **Não** | Evita flakiness por dependência de endpoint público de terceiros; recomendado em fase futura com `page.route` (stub determinístico) | Não automatizado |
| SHP-01 | Shopping / Checkout | Adicionar produtos ao carrinho e finalizar checkout | E2E | Fluxo e-commerce | P2 | **Não** | Fora do contexto principal definido no enunciado (plataforma administrativa centrada em usuários, formulários e componentes dinâmicos) | Não automatizado |
| A11Y-MANUAL | Acessibilidade | Navegação com leitor de tela (VoiceOver/NVDA), zoom 200% e qualidade textual de mensagens | Acessibilidade Manual | Experiência assistiva real | P1 | **Não** | Ferramentas automatizadas não substituem validação humana de semântica, compreensão e operação real com tecnologias assistivas | Não automatizado |
| PERF-01 | Carga / Stress | Execução concorrente massiva ou varredura de segurança | Não funcional | Disponibilidade / AppSec | N/A | **Não** | Explicitamente proibido pelas restrições do desafio (Seção 15) | Não automatizado |
