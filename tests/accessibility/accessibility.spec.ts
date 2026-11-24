import { expect, test } from '@fixtures/test.fixtures';
import { attachEvidence } from '@utils/evidence';
import { WCAG_21_AA_TAGS, runAccessibilityAudit } from '@utils/a11y.helper';

test.describe('Acessibilidade — labels, auditoria automatizada e teclado', () => {
  test(
    'A11Y-01: deve associar labels e não ter violações críticas no formulário, sem prender o teclado no modal',
    { tag: ['@a11y'] },
    async ({ page, registrationFormPage: form, accessibilityPage: a11y }, testInfo) => {
      await test.step('Validar que os campos do formulário têm label associado (A11Y-02)', async () => {
        await form.openSection();

        // getByLabel só resolve se houver associação programática <label for> ↔ <input id>.
        // Esta verificação explícita é necessária porque o axe-core NÃO detecta label quebrado
        // quando o campo tem placeholder (ele aceita o placeholder como nome acessível) —
        // comprovado removendo o `for` do label de e-mail: o axe não acusou nada.
        const labelledFields = [
          { field: form.fullNameInput, id: 'fullName' },
          { field: form.emailInput, id: 'email' },
          { field: form.passwordInput, id: 'password' },
          { field: form.phoneInput, id: 'phone' },
          { field: form.dobInput, id: 'dob' },
          { field: form.countrySelect, id: 'country' },
          { field: form.bioTextarea, id: 'bio' },
        ];
        for (const { field, id } of labelledFields) {
          await expect.soft(field, `Campo #${id} associado ao seu label`).toHaveAttribute('id', id);
        }
      });

      await test.step('Executar auditoria axe-core no formulário: zero violações críticas (A11Y-06)', async () => {
        const audit = await runAccessibilityAudit(page, testInfo, {
          include: '[data-testid="registration-form"]',
          attachmentName: 'axe-registration-form.json',
        });

        // Gate apenas em "critical": violações "serious" pré-existentes (contraste) ficam no anexo
        // do relatório e na matriz de riscos (RSK-A06), sem mascarar nem travar a suíte.
        const critical = audit.violations.filter((violation) => violation.impact === 'critical');
        expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
      });

      await test.step('Anexar auditoria da página inteira como evidência, sem bloquear (RSK-A01..A07)', async () => {
        // Violações pré-existentes do alvo (tabela de usuários, seção #a11y, contraste, headings)
        // ficam registradas no relatório para diagnóstico, sem virar gate até serem corrigidas.
        const pageAudit = await runAccessibilityAudit(page, testInfo, {
          attachmentName: 'axe-full-page.json',
          tags: [...WCAG_21_AA_TAGS, 'best-practice'],
        });
        testInfo.annotations.push({
          type: 'a11y-known-issues',
          description: pageAudit.violations.map((v) => `${v.id} (${v.impact}, ${v.nodesCount} nós)`).join('; '),
        });
      });

      await test.step('Operar o diálogo só por teclado: ordem de foco e saída com Escape (A11Y-03/04/07)', async () => {
        await a11y.scrollToSection('a11y');
        await a11y.focusTrapOpenButton.focus();
        await page.keyboard.press('Enter');

        await expect(a11y.focusTrapDialog).toBeVisible();
        await expect(a11y.focusTrapInput).toBeFocused();

        // Ordem de foco esperada dentro do diálogo, incluindo o retorno cíclico ao primeiro elemento.
        await page.keyboard.press('Tab');
        await expect(a11y.focusTrapActionButton).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(a11y.focusTrapCloseButton).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(a11y.focusTrapInput).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(a11y.focusTrapCloseButton).toBeFocused();
        await attachEvidence('focus-trap-aberto', a11y.ariaCard);

        // Sem armadilha de teclado: Escape fecha o diálogo e devolve o foco a quem o abriu.
        await page.keyboard.press('Escape');
        await expect(a11y.focusTrapDialog).toBeHidden();
        await expect(a11y.focusTrapOpenButton).toBeFocused();
      });
    },
  );
});
