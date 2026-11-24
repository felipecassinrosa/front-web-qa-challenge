import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const BASE_URL = process.env.BASE_URL || 'https://playwrightlab.github.io/';
const isCI = !!process.env.CI;

// Trace só de testes que falharam (inclui a tentativa que falhou de um teste instável).
// PW_TRACE=on grava o trace de todos os testes — usado no disparo manual do workflow,
// pois manter trace de toda execução multiplica o espaço de artefatos do repositório.
const TRACE_MODES = ['on', 'retain-on-failure'] as const;
type TraceMode = (typeof TRACE_MODES)[number];
const traceMode: TraceMode = TRACE_MODES.includes(process.env.PW_TRACE as TraceMode)
  ? (process.env.PW_TRACE as TraceMode)
  : 'retain-on-failure';

// O WebKit no runner do CI (2 vCPUs) é de 2 a 3x mais lento que o Chromium: o FRM-E2E-01 levou
// até 19,6 s no iPhone, contra ~4 s no Chromium. Os projetos WebKit ganham um orçamento maior
// por teste só no CI; os tempos-limite de ação e de asserção (10 s) não mudam, então um
// travamento real continua sendo pego.
const WEBKIT_TEST_TIMEOUT = isCI ? 45_000 : 30_000;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // No CI, o paralelismo é entre jobs: cada projeto roda num runner separado. Dentro do job,
  // 1 worker. Medido: com 2 workers no runner de 2 vCPUs (repo privado), o WebKit levou de
  // 27 a 40 s no FRM-E2E-01, que falhou na 1ª tentativa em 3 de 4 execuções; o mesmo teste
  // rodando sozinho (no retry) levou ~14 s. Localmente, 3 workers.
  workers: isCI ? 1 : 3,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  // No CI, cada job da matriz gera também um "blob" que o job merge-reports consolida em um único HTML.
  reporter: isCI
    ? [
        ['github'],
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['blob', { fileName: `report-${process.env.PW_BLOB_NAME ?? 'ci'}.zip` }],
      ]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    // Evidências: screenshot ao fim de todo teste (passando ou falhando), prints do estado
    // validado anexados pelos próprios testes e trace conforme PW_TRACE. Vídeo só na nova
    // tentativa de um teste que falhou: gravar vídeo de todo teste custava CPU no CI, e o
    // trace da tentativa que falhou já é preservado para diagnóstico.
    trace: traceMode,
    screenshot: 'on',
    video: 'on-first-retry',
    locale: 'pt-BR',
  },
  projects: [
    {
      name: 'chromium',
      grepInvert: /@mobile-only/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      timeout: WEBKIT_TEST_TIMEOUT,
      grep: /@smoke/,
      grepInvert: /@mobile-only/,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-safari',
      timeout: WEBKIT_TEST_TIMEOUT,
      grep: /@mobile/,
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],
});
