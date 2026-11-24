import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class UsersTablePage extends BasePage {
  readonly card: Locator;
  readonly table: Locator;
  readonly headers: Locator;
  readonly rows: Locator;
  readonly searchInput: Locator;
  readonly rowsPerPageSelect: Locator;
  readonly roleFilterSelect: Locator;
  readonly addUserButton: Locator;
  readonly sortNameHeader: Locator;
  readonly tableInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.card = page.getByTestId('table-card');
    this.table = this.card.getByTestId('data-table');
    this.headers = this.table.locator('thead th');
    this.rows = this.table.locator('tbody tr');
    this.searchInput = this.card.getByPlaceholder('Search users...');
    // data-testid utilizado como contrato resiliente pois os selects não possuem <label> acessível (RSK-A01)
    this.rowsPerPageSelect = this.card.getByTestId('rows-per-page');
    this.roleFilterSelect = this.card.getByTestId('table-filter');
    this.addUserButton = this.card.getByRole('button', { name: /\+ Add User/i });
    this.sortNameHeader = this.table.getByTestId('sort-name');
    this.tableInfo = this.card.getByTestId('table-info');
  }

  async openSection(): Promise<void> {
    await this.gotoHome();
    await this.scrollToSection('tables');
  }

  async searchUser(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  async filterByRole(role: string): Promise<void> {
    await this.roleFilterSelect.selectOption(role);
  }

  async sortByName(): Promise<void> {
    await this.sortNameHeader.click();
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.card.getByTestId(`page-${pageNumber}`).click();
  }

  getRowByText(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  async deleteUserByName(userName: string): Promise<void> {
    const targetRow = this.getRowByText(userName).first();
    await targetRow.locator('[data-testid^="delete-"]').click();
  }

  async getHeaderLabels(): Promise<string[]> {
    const rawHeaders = await this.headers.allTextContents();
    return rawHeaders.map((header) => header.replace(/[↕↑↓]/g, '').trim()).filter(Boolean);
  }

  async getColumnValues(columnName: string): Promise<string[]> {
    const rawHeaders = await this.headers.allTextContents();
    const columnIndex = rawHeaders.findIndex((header) =>
      header.toLowerCase().includes(columnName.toLowerCase()),
    );

    if (columnIndex === -1) {
      throw new Error(`Coluna "${columnName}" não encontrada nos cabeçalhos: ${rawHeaders.join(', ')}`);
    }

    const rowCount = await this.rows.count();
    const values: string[] = [];

    for (let i = 0; i < rowCount; i++) {
      const cellText = await this.rows.nth(i).locator('td').nth(columnIndex).innerText();
      values.push(cellText.trim());
    }

    return values;
  }
}
