import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ResponsivePage extends BasePage {
  readonly hamburgerButton: Locator;
  readonly firstNavLink: Locator;
  readonly desktopOnlyBox: Locator;
  readonly tabletOnlyBox: Locator;
  readonly mobileOnlyBox: Locator;
  readonly alwaysVisibleBox: Locator;
  readonly breakpointLabel: Locator;
  readonly demoCards: Locator;
  readonly responsiveCard: Locator;

  constructor(page: Page) {
    super(page);
    this.hamburgerButton = page.getByRole('button', { name: 'Toggle menu' });
    this.firstNavLink = page.getByRole('navigation').getByRole('link', { name: 'Locators' });
    this.desktopOnlyBox = page.getByTestId('desktop-only');
    this.tabletOnlyBox = page.getByTestId('tablet-only');
    this.mobileOnlyBox = page.getByTestId('mobile-only');
    this.alwaysVisibleBox = page.getByTestId('always-visible');
    this.breakpointLabel = page.getByTestId('breakpoint-label');
    this.responsiveCard = page.getByTestId('responsive-card');
    this.demoCards = page.getByTestId('responsive-demo-grid').locator('[data-testid^="resp-item-"]');
  }

  async openSection(): Promise<void> {
    await this.gotoHome();
    await this.scrollToSection('responsive');
  }

  async hasHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  }
}
