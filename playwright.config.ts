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

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // Paralelismo controlado para não sobrecarregar a aplicação-alvo (restrição do case)
  workers: isCI ? 2 : 3,
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
    // validado anexados pelos próprios testes, trace conforme PW_TRACE e vídeo só em falha.
    trace: traceMode,
    screenshot: 'on',
    video: 'retain-on-failure',
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
      grep: /@smoke/,
      grepInvert: /@mobile-only/,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-safari',
      grep: /@mobile/,
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],
});
