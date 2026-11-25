import { USERS_TABLE_SEED } from '@data/userData.factory';
import { expect, test } from '@fixtures/test.fixtures';
import { attachEvidence } from '@utils/evidence';

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

      await test.step('Pesquisar por usuário existente e validar dados e situação', async () => {
        const { name, email, role, status } = USERS_TABLE_SEED.existingUser;
        await usersTablePage.searchUser(name);

        await expect(usersTablePage.rows).toHaveCount(1);
        const userRow = usersTablePage.getRowByText(name);
        // Asserção exata por coluna: `toContainText('active')` na linha também aceitaria "inactive".
        await expect(await usersTablePage.getCell(userRow, 'Name')).toHaveText(name);
        await expect(await usersTablePage.getCell(userRow, 'Email')).toHaveText(email);
        await expect(await usersTablePage.getCell(userRow, 'Role')).toHaveText(role);
        await expect(await usersTablePage.getCell(userRow, 'Status')).toHaveText(status);

        await usersTablePage.clearSearch();
        await expect(usersTablePage.rows).toHaveCount(USERS_TABLE_SEED.defaultRowsPerPage);
      });

      await test.step('Navegar entre páginas da tabela', async () => {
        await usersTablePage.goToPage(2);
        await expect(usersTablePage.tableInfo).toContainText(
          `Showing 6-10 of ${USERS_TABLE_SEED.initialTotalEntries} entries`,
        );
        await expect(await usersTablePage.getCell(usersTablePage.rows.first(), 'Name')).toHaveText(
          USERS_TABLE_SEED.pageTwoFirstUser,
        );

        await usersTablePage.goToPage(1);
        await expect(usersTablePage.tableInfo).toContainText(
          `Showing 1-5 of ${USERS_TABLE_SEED.initialTotalEntries} entries`,
        );
      });

      await test.step('Ordenar usuários por nome e validar a ordem de todos os registros', async () => {
        const firstNameCell = await usersTablePage.getCell(usersTablePage.rows.first(), 'Name');

        // A ordem padrão (por ID) já é alfabética na página 1, então validar apenas o ASC seria um
        // falso positivo. A prova de que a ordenação funciona é a transição ASC → DESC.
        await usersTablePage.sortByName();
        await expect(firstNameCell).toHaveText(USERS_TABLE_SEED.firstUserAlphabetically);

        await usersTablePage.sortByName();
        await expect(firstNameCell).toHaveText(USERS_TABLE_SEED.lastUserAlphabetically);

        // Exibe todos os registros para validar a ordenação global, e não só a da página visível.
        await usersTablePage.setRowsPerPage(USERS_TABLE_SEED.maxRowsPerPage);
        await expect(usersTablePage.rows).toHaveCount(USERS_TABLE_SEED.initialTotalEntries);

        const namesDesc = await usersTablePage.getColumnValues('Name');
        const expectedDesc = [...namesDesc].sort((a, b) => b.localeCompare(a));
        expect(namesDesc).toEqual(expectedDesc);
      });

      await test.step('Excluir usuário e validar atualização da tabela', async () => {
        const userToDelete = USERS_TABLE_SEED.lastUserAlphabetically;
        await usersTablePage.deleteUserByName(userToDelete);

        await expect(usersTablePage.getRowByText(userToDelete)).toHaveCount(0);
        await expect(usersTablePage.rows).toHaveCount(USERS_TABLE_SEED.initialTotalEntries - 1);
        await expect(usersTablePage.tableInfo).toContainText(
          `of ${USERS_TABLE_SEED.initialTotalEntries - 1} entries`,
        );
        await attachEvidence('tabela-apos-exclusao', usersTablePage.card);
      });
    },
  );

  test(
    'USR-NEG-01: deve exibir tabela sem registros ao pesquisar por usuário inexistente',
    {
      tag: ['@users', '@negative'],
      // Aparece no relatório HTML ao lado do teste: ele passa descrevendo o comportamento atual,
      // que é um defeito conhecido do produto. Se o PlayLab ganhar um estado vazio, revisar o teste.
      annotation: {
        type: 'issue',
        description:
          'RSK-U01: a busca sem resultado mostra a tabela vazia e "Showing 1-0 of 0 entries", sem mensagem de estado vazio.',
      },
    },
    async ({ usersTablePage }) => {
      await test.step('Pesquisar por termo sem correspondência', async () => {
        await usersTablePage.openSection();
        await usersTablePage.searchUser(USERS_TABLE_SEED.nonExistentQuery);

        await expect(usersTablePage.rows).toHaveCount(0);
        await expect(usersTablePage.table).toBeVisible();
        // Achado documentado em RSK-U01: o PlayLab exibe "Showing 1-0 of 0 entries" sem mensagem de empty state.
        await expect(usersTablePage.tableInfo).toContainText('of 0 entries');
        await attachEvidence('busca-sem-resultado', usersTablePage.card);
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
