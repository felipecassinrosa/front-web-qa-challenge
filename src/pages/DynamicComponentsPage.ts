import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type DynamicTableRecord = Record<string, string>;

export class DynamicComponentsPage extends BasePage {
  // Delayed Dropdown (seção #forms -> Dropdown Variants)
  readonly loadDelayedOptionsButton: Locator;
  readonly delayedCategorySelect: Locator;
  readonly delayedDropdownLoader: Locator;
  readonly delayedDropdownResult: Locator;

  // Dynamic Table (seção #tables -> Dynamic Table)
  readonly dynamicFruitTable: Locator;
  readonly dynamicFruitHeaders: Locator;
  readonly dynamicFruitRows: Locator;

  constructor(page: Page) {
    super(page);
    this.loadDelayedOptionsButton = page.getByTestId('load-delayed-dropdown-btn');
    this.delayedCategorySelect = page.getByLabel('Select Category');
    this.delayedDropdownLoader = page.getByTestId('delayed-dropdown-loader');
    this.delayedDropdownResult = page.getByTestId('delayed-dropdown-result');

    this.dynamicFruitTable = page.getByTestId('dynamic-fruit-table');
    this.dynamicFruitHeaders = this.dynamicFruitTable.locator('thead th');
    this.dynamicFruitRows = this.dynamicFruitTable.locator('tbody tr');
  }

  async openDelayedDropdown(): Promise<void> {
    await this.gotoHome();
    await this.loadDelayedOptionsButton.scrollIntoViewIfNeeded();
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
      const cells = await this.dynamicFruitRows.nth(rowIndex).locator('td').allInnerTexts();
      const record: DynamicTableRecord = {};
      headers.forEach((header, colIndex) => {
        record[header] = (cells[colIndex] ?? '').trim();
      });
      records.push(record);
    }

    return records;
  }
}
