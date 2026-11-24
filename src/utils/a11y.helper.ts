import AxeBuilder from '@axe-core/playwright';
import { Page, TestInfo } from '@playwright/test';

export interface AccessibilityAuditOptions {
  include?: string;
  attachmentName?: string;
  wcagTags?: string[];
}

export interface AccessibilityAuditSummary {
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  violations: Array<{
    id: string;
    impact: string | null | undefined;
    description: string;
    nodesCount: number;
    targets: string[];
  }>;
}

/**
 * Executa auditoria automatizada WCAG com axe-core e anexa o resumo estruturado ao relatório HTML.
 */
export async function runAccessibilityAudit(
  page: Page,
  testInfo: TestInfo,
  options: AccessibilityAuditOptions = {},
): Promise<AccessibilityAuditSummary> {
  const {
    include,
    attachmentName = 'axe-accessibility-report.json',
    wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  } = options;

  let builder = new AxeBuilder({ page }).withTags(wcagTags);

  if (include) {
    builder = builder.include(include);
  }

  const results = await builder.analyze();

  const summary: AccessibilityAuditSummary = {
    totalViolations: results.violations.length,
    criticalCount: results.violations.filter((v) => v.impact === 'critical').length,
    seriousCount: results.violations.filter((v) => v.impact === 'serious').length,
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodesCount: v.nodes.length,
      targets: v.nodes.slice(0, 5).map((node) => node.target.join(' > ')),
    })),
  };

  await testInfo.attach(attachmentName, {
    body: JSON.stringify(summary, null, 2),
    contentType: 'application/json',
  });

  return summary;
}
