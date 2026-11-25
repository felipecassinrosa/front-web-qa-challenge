import { DYNAMIC_FRUIT_TABLE_RULES } from '@data/userData.factory';
import { expect, test } from '@fixtures/test.fixtures';
import { attachEvidence } from '@utils/evidence';
import type { DynamicComponentsPage, DynamicTableRecord } from '@pages/DynamicComponentsPage';

const { expectedColumns, fruits, ranges, randomValues } = DYNAMIC_FRUIT_TABLE_RULES;

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

/** Lê a tabela pelos cabeçalhos, valida as regras de negócio e devolve o layout encontrado. */
async function readAndValidateTable(dynamic: DynamicComponentsPage) {
  // Espera a tabela inteira antes de ler: a leitura em lote não deve pegar a tabela no meio da montagem.
  await expect(dynamic.dynamicFruitRows).toHaveCount(Object.keys(fruits).length);

  const headers = await dynamic.getDynamicTableHeaders();
  expect(headers[0], 'A coluna Fruit é a única com posição fixa').toBe('Fruit');
  expect([...headers].sort()).toEqual([...expectedColumns].sort());

  const records = await dynamic.readDynamicTableRecords();
  expectRecordsToFollowBusinessRules(records);

  return { headers, fruitOrder: records.map((record) => record['Fruit']) };
}

test.describe('Componentes Dinâmicos — Dynamic Table', () => {
  test(
    'DYN-TBL-01: deve ler a tabela pelos cabeçalhos quando colunas e linhas mudam de posição após recarregar',
    { tag: ['@dynamic'] },
    async ({ page, dynamicComponentsPage: dynamic }) => {
      // O PlayLab embaralha colunas e linhas com Math.random a cada carga. Em vez de torcer para o
      // sorteio mudar a ordem, o teste fixa o sorteio: duas cargas com layouts diferentes, sempre.
      // Assim o teste prova a leitura por cabeçalho (DYN-03) e é reproduzível quando falha.
      const original = await test.step('Carga 1: sorteio fixado para manter a ordem original', async () => {
        await dynamic.fixRandomness(randomValues.keepOrder);
        await dynamic.openDynamicTable();

        const layout = await readAndValidateTable(dynamic);
        await attachEvidence('tabela-dinamica-primeira-carga', dynamic.dynamicFruitTable);
        return layout;
      });

      await test.step('Carga 2: recarregar com o sorteio fixado em outra ordem (DYN-04, DYN-05)', async () => {
        await dynamic.fixRandomness(randomValues.reorder);
        await page.reload();

        const reordered = await readAndValidateTable(dynamic);

        // Garante que o teste comparou dois layouts de fato diferentes, e não a mesma tabela duas vezes.
        expect(reordered.headers, 'Colunas em outra posição após o reload').not.toEqual(original.headers);
        expect(reordered.fruitOrder, 'Linhas em outra ordem após o reload').not.toEqual(original.fruitOrder);
        await attachEvidence('tabela-dinamica-apos-reload', dynamic.dynamicFruitTable);
      });
    },
  );
});
