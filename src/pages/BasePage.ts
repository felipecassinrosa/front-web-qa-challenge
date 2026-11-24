import { Locator, Page, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  readonly heroHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.getByRole('heading', { level: 1 });
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('./', { waitUntil: 'domcontentloaded' });
    await expect(this.heroHeading).toBeVisible();
  }

  async scrollToSection(sectionId: string): Promise<void> {
    const section = this.page.locator(`#${sectionId}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
  }
}
