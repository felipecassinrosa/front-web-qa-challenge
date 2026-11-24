import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccessibilityPage extends BasePage {
  readonly section: Locator;
  readonly ariaCard: Locator;
  readonly focusTrapOpenButton: Locator;
  readonly focusTrapDialog: Locator;
  readonly focusTrapInput: Locator;
  readonly focusTrapActionButton: Locator;
  readonly focusTrapCloseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.section = page.locator('#a11y');
    this.ariaCard = this.section.getByTestId('aria-card');
    this.focusTrapOpenButton = this.section.getByRole('button', { name: 'Open Focus Trap' });
    this.focusTrapDialog = page.getByRole('dialog', { name: 'Focus trap dialog' });
    this.focusTrapInput = this.focusTrapDialog.getByPlaceholder('Trapped input');
    this.focusTrapActionButton = this.focusTrapDialog.getByRole('button', { name: 'Action', exact: true });
    this.focusTrapCloseButton = this.focusTrapDialog.getByRole('button', { name: 'Close Trap' });
  }

  async openSection(): Promise<void> {
    await this.gotoHome();
    await this.scrollToSection('a11y');
  }
}
