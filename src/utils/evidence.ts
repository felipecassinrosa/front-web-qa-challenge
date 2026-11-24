import { Locator, Page, test } from '@playwright/test';

/**
 * Anexa ao relatório HTML um print do estado final validado, para que haja evidência visual
 * mesmo quando o teste passa (o screenshot automático da config só mostra o fim do teste).
 * Recebe um Locator para focar no componente validado ou a Page para registrar a área visível.
 */
export async function attachEvidence(name: string, target: Locator | Page): Promise<void> {
  await test.step(`Evidência: ${name}`, async () => {
    const body = await target.screenshot({ animations: 'disabled' });
    await test.info().attach(`evidencia-${name}`, { body, contentType: 'image/png' });
  });
}
