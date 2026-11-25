import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type DynamicTableRecord = Record<string, string>;

// Data arbitrária e fixa: o relógio congelado só precisa de um ponto de partida conhecido.
const CLOCK_START = new Date('2026-01-01T10:00:00Z');

export class DynamicComponentsPage extends BasePage {
  // Delayed Dropdown (seção #forms -> Dropdown Variants)
  readonly loadDelayedOptionsButton: Locator;
  readonly delayedCategorySelect: Locator;
  readonly delayedLoadedOptions: Locator;
  readonly delayedDropdownLoader: Locator;
  readonly delayedDropdownResult: Locator;
  readonly delayedDropdownCard: Locator;

  // Dynamic Table (seção #tables -> Dynamic Table)
  readonly dynamicFruitTable: Locator;
  readonly dynamicFruitHeaders: Locator;
  readonly dynamicFruitRows: Locator;

  constructor(page: Page) {
    super(page);
    this.loadDelayedOptionsButton = page.getByTestId('load-delayed-dropdown-btn');
    this.delayedCategorySelect = page.getByLabel('Select Category');
    this.delayedLoadedOptions = this.delayedCategorySelect.locator('option:not([value=""])');
    this.delayedDropdownLoader = page.getByTestId('delayed-dropdown-loader');
    this.delayedDropdownResult = page.getByTestId('delayed-dropdown-result');
    this.delayedDropdownCard = page.getByTestId('delayed-dropdown-card');

    this.dynamicFruitTable = page.getByTestId('dynamic-fruit-table');
    this.dynamicFruitHeaders = this.dynamicFruitTable.locator('thead th');
    this.dynamicFruitRows = this.dynamicFruitTable.locator('tbody tr');
  }

  /**
   * Abre a página com o relógio do navegador congelado: `setTimeout` e `Date` só andam quando o
   * teste chama `advanceTime()`. O estado "carregando" fica estável pelo tempo que o teste
   * precisar, sem depender de a máquina ser rápida o bastante para vê-lo dentro dos ~2 s reais
   * do componente. Só `clock.install()` não basta: sem `pauseAt` o tempo continua correndo.
   */
  async openDelayedDropdownWithFrozenClock(): Promise<void> {
    await this.page.clock.install({ time: CLOCK_START });
    await this.gotoHome();
    // O carregamento da página pode levar segundos no CI; o instante da pausa fica bem à frente
    // para nunca cair no passado do relógio da página.
    await this.page.clock.pauseAt(new Date(CLOCK_START.getTime() + 60_000));
    await this.loadDelayedOptionsButton.scrollIntoViewIfNeeded();
  }

  /** Avança o relógio congelado: dispara os timers da página que vencem nesse intervalo. */
  async advanceTime(milliseconds: number): Promise<void> {
    await this.page.clock.runFor(milliseconds);
  }

  /**
   * Fixa o valor de `Math.random` antes de os scripts da página rodarem, o que torna determinístico
   * o embaralhamento da Dynamic Table. Cada chamada vale para as próximas navegações (incluindo
   * `reload`); o script registrado por último roda por último e prevalece sobre os anteriores.
   */
  async fixRandomness(value: number): Promise<void> {
    await this.page.addInitScript((fixed) => {
      Math.random = () => fixed;
    }, value);
  }

  async openDynamicTable(): Promise<void> {
    await this.gotoHome();
    await this.dynamicFruitTable.scrollIntoViewIfNeeded();
  }

  async triggerDelayedOptionsLoad(): Promise<void> {
    await this.loadDelayedOptionsButton.click();
  }

  async selectDelayedCategory(categoryLabel: string): Promise<void> {
    await this.delayedCategorySelect.selectOption({ label: categoryLabel });
  }

  async getDynamicTableHeaders(): Promise<string[]> {
    const texts = await this.dynamicFruitHeaders.allTextContents();
    return texts.map((text) => text.trim());
  }

  async readDynamicTableRecords(): Promise<DynamicTableRecord[]> {
    const headers = await this.getDynamicTableHeaders();
    const rowCount = await this.dynamicFruitRows.count();
    const records: DynamicTableRecord[] = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      // textContent (e não innerText) para não sofrer efeito de text-transform do CSS.
      const cells = await this.dynamicFruitRows.nth(rowIndex).locator('td').allTextContents();
      const record: DynamicTableRecord = {};
      headers.forEach((header, colIndex) => {
        record[header] = (cells[colIndex] ?? '').trim();
      });
      records.push(record);
    }

    return records;
  }
}
