import { USERS_TABLE_SEED } from '@data/userData.factory';
import { expect, test } from '@fixtures/test.fixtures';

test.describe('Tabela de Usuários — Gerenciamento de Usuários', () => {
  test(
    'USR-E2E-01: deve carregar, pesquisar, paginar, ordenar e excluir usuário na tabela',
    { tag: ['@smoke', '@users', '@mobile'] },
    async ({ usersTablePage }) => {
      await test.step('Acessar a seção de tabela e validar estrutura inicial', async () => {
        await usersTablePage.openSection();
        await expect(usersTablePage.rows).toHaveCount(USERS_TABLE_SEED.defaultRowsPerPage);
        await expect(usersTablePage.tableInfo).toContainText(
          `Showing 1-5 of ${USERS_TABLE_SEED.initialTotalEntries} entries`,
        );

        const headers = await usersTablePage.getHeaderLabels();
        expect(headers).toEqual(USERS_TABLE_SEED.expectedHeaders);
      });

      await test.step('Pesquisar por usuário existente e validar dados e status', async () => {
        const { name, email, role, status } = USERS_TABLE_SEED.existingUser;
        await usersTablePage.searchUser(name);

        await expect(usersTablePage.rows).toHaveCount(1);
        const userRow = usersTablePage.getRowByText(name);
        await expect(userRow).toContainText(email);
        await expect(userRow).toContainText(role);
        await expect(userRow).toContainText(status);

        await usersTablePage.clearSearch();
        await expect(usersTablePage.rows).toHaveCount(USERS_TABLE_SEED.defaultRowsPerPage);
      });

      await test.step('Navegar entre páginas da tabela', async () => {
        await usersTablePage.goToPage(2);
        await expect(usersTablePage.tableInfo).toContainText(
          `Showing 6-10 of ${USERS_TABLE_SEED.initialTotalEntries} entries`,
        );
        await expect(usersTablePage.rows.first()).toContainText(USERS_TABLE_SEED.pageTwoFirstUser);

        await usersTablePage.goToPage(1);
        await expect(usersTablePage.tableInfo).toContainText(
          `Showing 1-5 of ${USERS_TABLE_SEED.initialTotalEntries} entries`,
        );
      });

      let firstUserDescending = '';

      await test.step('Ordenar usuários por nome (ascendente e descendente)', async () => {
        await usersTablePage.sortByName();
        const namesAsc = await usersTablePage.getColumnValues('Name');
        const expectedAsc = [...namesAsc].sort((a, b) => a.localeCompare(b));
        expect(namesAsc).toEqual(expectedAsc);

        await usersTablePage.sortByName();
        const namesDesc = await usersTablePage.getColumnValues('Name');
        const expectedDesc = [...namesDesc].sort((a, b) => b.localeCompare(a));
        expect(namesDesc).toEqual(expectedDesc);
        expect(namesDesc[0]).not.toEqual(namesAsc[0]);

        firstUserDescending = namesDesc[0];
      });

      await test.step('Executar ação de exclusão e validar atualização da tabela', async () => {
        await usersTablePage.deleteUserByName(firstUserDescending);
        await expect(usersTablePage.getRowByText(firstUserDescending)).toHaveCount(0);
        await expect(usersTablePage.tableInfo).toContainText(
          `of ${USERS_TABLE_SEED.initialTotalEntries - 1} entries`,
        );
      });
    },
  );

  test(
    'USR-NEG-01: deve exibir tabela sem registros ao pesquisar por usuário inexistente',
    { tag: ['@users', '@negative'] },
    async ({ usersTablePage }) => {
      await test.step('Pesquisar por termo sem correspondência', async () => {
        await usersTablePage.openSection();
        await usersTablePage.searchUser(USERS_TABLE_SEED.nonExistentQuery);

        await expect(usersTablePage.rows).toHaveCount(0);
        await expect(usersTablePage.table).toBeVisible();
        // Achado documentado em RSK-U01: o PlayLab exibe "Showing 1-0 of 0 entries" sem mensagem de empty state.
        await expect(usersTablePage.tableInfo).toContainText('of 0 entries');
      });

      await test.step('Limpar busca e confirmar recuperação da listagem padrão', async () => {
        await usersTablePage.clearSearch();
        await expect(usersTablePage.rows).toHaveCount(USERS_TABLE_SEED.defaultRowsPerPage);
        await expect(usersTablePage.tableInfo).toContainText(
          `Showing 1-5 of ${USERS_TABLE_SEED.initialTotalEntries} entries`,
        );
      });
    },
  );
});
