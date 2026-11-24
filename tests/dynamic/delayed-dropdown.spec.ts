import { DELAYED_DROPDOWN_SEED } from '@data/userData.factory';
import { expect, test } from '@fixtures/test.fixtures';
import { attachEvidence } from '@utils/evidence';

test.describe('Componentes Assíncronos — Delayed Dropdown', () => {
  test(
    'DYN-ASYNC-01: deve aguardar o carregamento assíncrono e selecionar uma opção carregada dinamicamente',
    { tag: ['@smoke', '@dynamic'] },
    async ({ dynamicComponentsPage: dynamic }) => {
      await dynamic.openDelayedDropdown();

      await test.step('Validar o estado inicial: dropdown desabilitado e sem opções reais', async () => {
        await expect(dynamic.delayedCategorySelect).toBeDisabled();
        await expect(dynamic.delayedCategorySelect.locator('option')).toHaveText([
          DELAYED_DROPDOWN_SEED.placeholderBeforeLoad,
        ]);
        await expect(dynamic.delayedDropdownLoader).toBeHidden();
      });

      await test.step('Disparar o carregamento e validar o estado de loading', async () => {
        await dynamic.triggerDelayedOptionsLoad();

        await expect(dynamic.delayedDropdownLoader).toBeVisible();
        await expect(dynamic.delayedDropdownLoader).toHaveText(DELAYED_DROPDOWN_SEED.loadingText);
        // Proteção contra múltiplos cliques (DYN-06): o botão fica desabilitado enquanto carrega.
        await expect(dynamic.loadDelayedOptionsButton).toBeDisabled();
      });

      await test.step('Aguardar a conclusão por estado observável, sem espera fixa', async () => {
        // A sincronização é feita pelas transições do componente (select habilitado, loader oculto),
        // nunca por waitForTimeout: o teste tolera tanto uma resposta mais rápida quanto mais lenta.
        await expect(dynamic.delayedCategorySelect).toBeEnabled();
        await expect(dynamic.delayedDropdownLoader).toBeHidden();

        const loadedOptions = dynamic.delayedCategorySelect.locator('option:not([value=""])');
        await expect(loadedOptions).toHaveText(DELAYED_DROPDOWN_SEED.expectedCategories);
      });

      await test.step('Selecionar uma opção carregada e validar o resultado exibido', async () => {
        await dynamic.selectDelayedCategory(DELAYED_DROPDOWN_SEED.categoryToSelect);

        await expect(dynamic.delayedCategorySelect).toHaveValue(
          DELAYED_DROPDOWN_SEED.categoryToSelect.toLowerCase(),
        );
        await expect(dynamic.delayedDropdownResult).toHaveText(
          `Selected: ${DELAYED_DROPDOWN_SEED.categoryToSelect}`,
        );
        await attachEvidence('dropdown-opcao-selecionada', dynamic.delayedDropdownCard);
      });
    },
  );
});
