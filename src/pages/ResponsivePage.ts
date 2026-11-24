import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ResponsivePage extends BasePage {
  readonly hamburgerButton: Locator;
  readonly desktopOnlyBox: Locator;
  readonly tabletOnlyBox: Locator;
  readonly mobileOnlyBox: Locator;
  readonly alwaysVisibleBox: Locator;
  readonly breakpointLabel: Locator;
  readonly demoCard1: Locator;
  readonly demoCard2: Locator;
  readonly demoCard3: Locator;

  constructor(page: Page) {
    super(page);
    this.hamburgerButton = page.locator('#hamburger');
    this.desktopOnlyBox = page.getByTestId('desktop-only');
    this.tabletOnlyBox = page.getByTestId('tablet-only');
    this.mobileOnlyBox = page.getByTestId('mobile-only');
    this.alwaysVisibleBox = page.getByTestId('always-visible');
    this.breakpointLabel = page.getByTestId('breakpoint-label');
    this.demoCard1 = page.getByTestId('resp-item-1');
    this.demoCard2 = page.getByTestId('resp-item-2');
    this.demoCard3 = page.getByTestId('resp-item-3');
  }

  async openSection(): Promise<void> {
    await this.gotoHome();
    await this.scrollToSection('responsive');
  }

  async hasHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  }
}
