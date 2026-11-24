import { Locator, Page, test } from '@playwright/test';

// Medido no CI: o print de um componente leva de 0,1 a 1,6 s (WebKit incluído). 3 s dá folga
// sem gastar à toa o tempo do teste quando o print não sai.
const ELEMENT_SCREENSHOT_TIMEOUT = 3_000;

// Elementos fixos da página (barra de navegação e banner de cookies) aparecem fora do lugar no
// print de um componente — por cima do título ou no meio de uma tabela. Eles são ocultados só
// nesse print; o teste em si roda com eles visíveis, e o print da tela inteira os mantém.
const HIDE_FIXED_OVERLAYS = '#navbar, [data-testid="cookie-banner"] { visibility: hidden !important; }';

/**
 * Anexa ao relatório HTML um print do estado final validado, para que haja evidência visual
 * mesmo quando o teste passa. Recebe um Locator para focar no componente validado ou a Page
 * para registrar a área visível.
 *
 * A evidência é diagnóstico, não asserção: ela é tirada depois que as asserções do passo já
 * passaram e nunca reprova o teste. O print de um elemento exige rolar até ele e esperar que
 * fique estável; no WebKit do CI isso já levou mais de 10 s com o elemento parado na tela.
 * Por isso há um tempo-limite próprio e, se o print do elemento não sair, registra-se a área
 * visível da página com uma nota.
 */
export async function attachEvidence(name: string, target: Locator | Page): Promise<void> {
  await test.step(`Evidência: ${name}`, async () => {
    const attachmentName = `evidencia-${name}`;
    const page = isPage(target) ? target : target.page();

    if (!isPage(target)) {
      // Rola até o componente via JavaScript, sem esperar estabilidade. No WebKit do CI, a
      // rolagem feita pelo Playwright antes do print chegou a levar ~7 s. Assim o print não
      // precisa rolar, e o fallback (área visível da página) passa a mostrar o componente.
      await target
        .evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest' }), undefined, {
          timeout: ELEMENT_SCREENSHOT_TIMEOUT,
        })
        .catch(() => undefined);
    }

    try {
      const body = await target.screenshot({
        animations: 'disabled',
        timeout: ELEMENT_SCREENSHOT_TIMEOUT,
        ...(isPage(target) ? {} : { style: HIDE_FIXED_OVERLAYS }),
      });
      await test.info().attach(attachmentName, { body, contentType: 'image/png' });
      return;
    } catch (error) {
      await test.info().attach(`${attachmentName}-nota.txt`, {
        body: `Print do elemento não capturado (${firstLine(error)}). Registrada a área visível da página.`,
        contentType: 'text/plain',
      });
    }

    try {
      const body = await page.screenshot({ timeout: 2 * ELEMENT_SCREENSHOT_TIMEOUT });
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
