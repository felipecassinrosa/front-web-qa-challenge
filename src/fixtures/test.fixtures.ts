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
  browserLogs: void;
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

  /**
   * Fixture automática: observa o navegador durante o teste e anexa ao relatório os erros de
   * console, exceções de página e requisições com falha. Não reprova o teste — serve como log
   * de diagnóstico ao lado do trace, do vídeo e dos screenshots.
   */
  browserLogs: [
    async ({ page }, use, testInfo) => {
      const logs: string[] = [];
      const timestamp = () => new Date().toISOString();

      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') {
          logs.push(`${timestamp()} [console.${message.type()}] ${message.text()}`);
        }
      });
      page.on('pageerror', (error) => logs.push(`${timestamp()} [pageerror] ${error.message}`));
      page.on('requestfailed', (request) =>
        logs.push(`${timestamp()} [requestfailed] ${request.method()} ${request.url()} — ${request.failure()?.errorText}`),
      );
      page.on('response', (response) => {
        if (response.status() >= 400) {
          logs.push(`${timestamp()} [http ${response.status()}] ${response.request().method()} ${response.url()}`);
        }
      });

      await use();

      await testInfo.attach('browser-logs.txt', {
        body: logs.length ? logs.join('\n') : 'Nenhum erro de console, exceção de página ou falha de rede registrado.',
        contentType: 'text/plain',
      });
    },
    { auto: true },
  ],
});

export { expect };
