import { Locator, Page, test } from '@playwright/test';

const ELEMENT_SCREENSHOT_TIMEOUT = 5_000;

/**
 * Anexa ao relatório HTML um print do estado final validado, para que haja evidência visual
 * mesmo quando o teste passa. Recebe um Locator para focar no componente validado ou a Page
 * para registrar a área visível.
 *
 * A evidência é diagnóstico, não asserção: ela é tirada depois que as asserções do passo já
 * passaram e nunca reprova o teste. O print de um elemento exige rolar até ele e esperar que
 * fique estável; no WebKit mobile do CI isso já levou mais de 10 s com o elemento parado na
 * tela (runner lento), o que deixou o teste instável. Por isso há um tempo-limite próprio e,
 * se o print do elemento não sair, registra-se a área visível da página com uma nota.
 */
export async function attachEvidence(name: string, target: Locator | Page): Promise<void> {
  await test.step(`Evidência: ${name}`, async () => {
    const attachmentName = `evidencia-${name}`;
    const page = isPage(target) ? target : target.page();

    try {
      const body = await target.screenshot({ animations: 'disabled', timeout: ELEMENT_SCREENSHOT_TIMEOUT });
      await test.info().attach(attachmentName, { body, contentType: 'image/png' });
      return;
    } catch (error) {
      await test.info().attach(`${attachmentName}-nota.txt`, {
        body: `Print do elemento não capturado (${firstLine(error)}). Registrada a área visível da página.`,
        contentType: 'text/plain',
      });
    }

    try {
      const body = await page.screenshot({ timeout: ELEMENT_SCREENSHOT_TIMEOUT });
      await test.info().attach(`${attachmentName}-tela`, { body, contentType: 'image/png' });
    } catch (error) {
      await test.info().attach(`${attachmentName}-falhou.txt`, {
        body: `Nenhum print capturado (${firstLine(error)}).`,
        contentType: 'text/plain',
      });
    }
  });
}

function isPage(target: Locator | Page): target is Page {
  return 'goto' in target;
}

function firstLine(error: unknown): string {
  return String(error instanceof Error ? error.message : error).split('\n')[0];
}
