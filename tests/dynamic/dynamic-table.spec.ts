import { DYNAMIC_FRUIT_TABLE_RULES } from '@data/userData.factory';
import { expect, test } from '@fixtures/test.fixtures';
import type { DynamicTableRecord } from '@pages/DynamicComponentsPage';

const { expectedColumns, fruits, ranges } = DYNAMIC_FRUIT_TABLE_RULES;

/**
 * Valida cada registro pelas regras de negócio estáveis, sem depender da posição das colunas,
 * da ordem das linhas nem dos valores numéricos sorteados a cada carga.
 */
function expectRecordsToFollowBusinessRules(records: DynamicTableRecord[]): void {
  expect(records.map((record) => record['Fruit']).sort()).toEqual(Object.keys(fruits).sort());

  for (const record of records) {
    const fruit = record['Fruit'];
    const reference = fruits[fruit];

    expect.soft(record['Color'], `Cor de ${fruit}`).toBe(reference.color);
    expect.soft(record['Season'], `Estação de ${fruit}`).toBe(reference.season);

    expect.soft(record['Weight (g)'], `Peso de ${fruit}`).toMatch(/^\d+$/);
    expect.soft(Number(record['Weight (g)'])).toBeGreaterThanOrEqual(ranges.weight.min);
    expect.soft(Number(record['Weight (g)'])).toBeLessThanOrEqual(ranges.weight.max);

    expect.soft(record['Price (₹/kg)'], `Preço de ${fruit}`).toMatch(/^₹\d+$/);
    const price = Number(record['Price (₹/kg)'].replace('₹', ''));
    expect.soft(price).toBeGreaterThanOrEqual(ranges.price.min);
    expect.soft(price).toBeLessThanOrEqual(ranges.price.max);

    expect.soft(record['Stock'], `Estoque de ${fruit}`).toMatch(/^\d+$/);
    expect.soft(Number(record['Stock'])).toBeGreaterThanOrEqual(ranges.stock.min);
    expect.soft(Number(record['Stock'])).toBeLessThanOrEqual(ranges.stock.max);
  }
}

test.describe('Componentes Dinâmicos — Dynamic Table', () => {
  test(
    'DYN-TBL-01: deve ler a tabela pelos cabeçalhos mesmo com colunas e linhas embaralhadas a cada carga',
    { tag: ['@dynamic'] },
    async ({ page, dynamicComponentsPage: dynamic }) => {
      await dynamic.openDynamicTable();

      await test.step('Validar estrutura e dados da primeira carga', async () => {
        await expect(dynamic.dynamicFruitRows).toHaveCount(Object.keys(fruits).length);

        const headers = await dynamic.getDynamicTableHeaders();
        expect(headers[0], 'A coluna Fruit é a única com posição fixa').toBe('Fruit');
        expect([...headers].sort()).toEqual([...expectedColumns].sort());

        expectRecordsToFollowBusinessRules(await dynamic.readDynamicTableRecords());
      });

      await test.step('Recarregar a página e validar que as regras continuam válidas', async () => {
        await page.reload();
        await expect(dynamic.dynamicFruitRows).toHaveCount(Object.keys(fruits).length);

        const headers = await dynamic.getDynamicTableHeaders();
        expect([...headers].sort()).toEqual([...expectedColumns].sort());

        // Não afirmamos que a ordem mudou: o embaralhamento é aleatório e pode repetir a ordem
        // anterior, o que tornaria essa asserção instável sem comprovar nenhum comportamento.
        expectRecordsToFollowBusinessRules(await dynamic.readDynamicTableRecords());
      });
    },
  );
});
