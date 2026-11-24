import { test as base, expect } from '@playwright/test';
import { AccessibilityPage } from '@pages/AccessibilityPage';
import { DynamicComponentsPage } from '@pages/DynamicComponentsPage';
import { RegistrationFormPage } from '@pages/RegistrationFormPage';
import { ResponsivePage } from '@pages/ResponsivePage';
import { UsersTablePage } from '@pages/UsersTablePage';

interface AppFixtures {
  usersTablePage: UsersTablePage;
  registrationFormPage: RegistrationFormPage;
  dynamicComponentsPage: DynamicComponentsPage;
  accessibilityPage: AccessibilityPage;
  responsivePage: ResponsivePage;
}

export const test = base.extend<AppFixtures>({
  usersTablePage: async ({ page }, use) => {
    await use(new UsersTablePage(page));
  },
  registrationFormPage: async ({ page }, use) => {
    await use(new RegistrationFormPage(page));
  },
  dynamicComponentsPage: async ({ page }, use) => {
    await use(new DynamicComponentsPage(page));
  },
  accessibilityPage: async ({ page }, use) => {
    await use(new AccessibilityPage(page));
  },
  responsivePage: async ({ page }, use) => {
    await use(new ResponsivePage(page));
  },
});

export { expect };
