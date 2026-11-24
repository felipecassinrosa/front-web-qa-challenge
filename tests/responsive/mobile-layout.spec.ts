import { USERS_TABLE_SEED } from '@data/userData.factory';
import { expect, test } from '@fixtures/test.fixtures';
import { attachEvidence } from '@utils/evidence';

test.describe('Responsividade — layout em resolução mobile', () => {
  test(
    'RSP-MOB-01: deve adaptar navegação e layout em tela reduzida sem scroll horizontal',
    { tag: ['@mobile', '@mobile-only'] },
    async ({ page, responsivePage: responsive, usersTablePage }) => {
      await responsive.openSection();

      await test.step('Validar ausência de scroll horizontal no documento (RSP-04)', async () => {
        expect(await responsive.hasHorizontalOverflow()).toBe(false);
      });

      await test.step('Abrir o menu hambúrguer e acessar os links de navegação (RSP-05)', async () => {
        await expect(responsive.hamburgerButton).toBeVisible();
        await expect(responsive.firstNavLink).toBeHidden();

        await responsive.hamburgerButton.click();
        await expect(responsive.firstNavLink).toBeVisible();
        await attachEvidence('menu-mobile-aberto', page);

        await responsive.hamburgerButton.click();
        await expect(responsive.firstNavLink).toBeHidden();
      });

      await test.step('Validar o breakpoint e a visibilidade condicional dos elementos', async () => {
        await expect(responsive.breakpointLabel).toHaveText(/mobile/i);
        await expect(responsive.mobileOnlyBox).toBeVisible();
        await expect(responsive.alwaysVisibleBox).toBeVisible();
        await expect(responsive.desktopOnlyBox).toBeHidden();
        await expect(responsive.tabletOnlyBox).toBeHidden();
        await attachEvidence('layout-mobile', responsive.responsiveCard);
      });

      await test.step('Validar que os cards empilham verticalmente sem sobreposição (RSP-03)', async () => {
        await expect(responsive.demoCards).toHaveCount(3);
        const viewportWidth = page.viewportSize()!.width;

        const boxes = [];
        for (const card of await responsive.demoCards.all()) {
          const box = await card.boundingBox();
          expect(box, 'Card renderizado com dimensões').not.toBeNull();
          boxes.push(box!);
        }

        for (const [index, box] of boxes.entries()) {
          expect(box.x, `Card ${index + 1} dentro da viewport`).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width, `Card ${index + 1} dentro da viewport`).toBeLessThanOrEqual(viewportWidth);

          const previous = boxes[index - 1];
          if (previous) {
            expect(box.x, 'Cards alinhados na mesma coluna').toBeCloseTo(previous.x, 0);
            expect(box.y, 'Card abaixo do anterior, sem sobreposição').toBeGreaterThanOrEqual(
              previous.y + previous.height,
            );
          }
        }
      });

      await test.step('Acessar a ação de exclusão da tabela de usuários em tela reduzida (RSP-05)', async () => {
        // A tabela (~706px) é mais larga que a viewport (390px) e fica num container com scroll
        // interno (RSK-U03). O teste garante que a ação continua alcançável e operável.
        await usersTablePage.scrollToSection('tables');
        const deleteButton = usersTablePage.rows.first().locator('[data-testid^="delete-"]');

        await deleteButton.scrollIntoViewIfNeeded();
        await expect(deleteButton).toBeInViewport();
        await deleteButton.click();

        await expect(usersTablePage.tableInfo).toContainText(
          `of ${USERS_TABLE_SEED.initialTotalEntries - 1} entries`,
        );
        expect(await responsive.hasHorizontalOverflow()).toBe(false);
      });
    },
  );
});
