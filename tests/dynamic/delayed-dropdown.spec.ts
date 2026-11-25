import { DELAYED_DROPDOWN_SEED } from '@data/userData.factory';
import { expect, test } from '@fixtures/test.fixtures';
import { attachEvidence } from '@utils/evidence';

test.describe('Componentes Assíncronos — Delayed Dropdown', () => {
  test(
    'DYN-ASYNC-01: deve aguardar o carregamento assíncrono e selecionar uma opção carregada dinamicamente',
    { tag: ['@smoke', '@dynamic'] },
    async ({ dynamicComponentsPage: dynamic }) => {
      // O relógio da página fica congelado: o estado "carregando" dura até o teste avançar o tempo.
      // Sem isso, validar o loader dependeria de a máquina ser rápida o bastante para vê-lo
      // dentro dos ~2 s reais do componente, e o teste ficaria instável em runners lentos.
      await dynamic.openDelayedDropdownWithFrozenClock();

      await test.step('Validar o estado inicial: dropdown desabilitado e sem opções reais', async () => {
        await expect(dynamic.delayedCategorySelect).toBeDisabled();
        await expect(dynamic.delayedCategorySelect.locator('option')).toHaveText([
          DELAYED_DROPDOWN_SEED.placeholderBeforeLoad,
        ]);
        await expect(dynamic.delayedDropdownLoader).toBeHidden();
      });

      await test.step('Disparar o carregamento e validar o estado de loading (DYN-07)', async () => {
        await dynamic.triggerDelayedOptionsLoad();

        await expect(dynamic.delayedDropdownLoader).toBeVisible();
        await expect(dynamic.delayedDropdownLoader).toHaveText(DELAYED_DROPDOWN_SEED.loadingText);
        await expect(dynamic.loadDelayedOptionsButton).toBeDisabled();
        await expect(dynamic.delayedCategorySelect).toBeDisabled();
      });

      await test.step('Clicar de novo durante a carga não pode carregar as opções duas vezes (DYN-06)', async () => {
        // `force` ignora a checagem de "habilitado" do Playwright e clica mesmo no botão desabilitado,
        // como um usuário impaciente. A prova de que nada foi duplicado vem na lista de opções abaixo.
        await dynamic.loadDelayedOptionsButton.click({ force: true });
        await expect(dynamic.delayedDropdownLoader).toBeVisible();
      });

      await test.step('Avançar o tempo e aguardar a conclusão por estado observável (DYN-01)', async () => {
        await dynamic.advanceTime(DELAYED_DROPDOWN_SEED.clockAdvanceMs);

        // Mesmo com o relógio controlado, a espera é pelo estado: select habilitado e loader oculto.
        await expect(dynamic.delayedCategorySelect).toBeEnabled();
        await expect(dynamic.delayedDropdownLoader).toBeHidden();
        // Lista exata: se o clique extra tivesse disparado outro carregamento, haveria opções repetidas.
        await expect(dynamic.delayedLoadedOptions).toHaveText(DELAYED_DROPDOWN_SEED.expectedCategories);
      });

      await test.step('Selecionar uma opção carregada e validar o resultado exibido (DYN-02)', async () => {
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
