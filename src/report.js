export function summarizePriceResponse(payload) {
  const data = payload?.data ?? payload ?? {};
  return Object.entries(data).map(([symbol, value]) => ({
    symbol,
    price: typeof value === 'number' ? value : value?.price,
  })).filter((item) => typeof item.price === 'number');
}

export function buildFindings({ hasApiKey, cliAvailable, apiChecks }) {
  const findings = [];

  if (!hasApiKey) {
    findings.push({
      severity: 'high',
      title: 'API key setup needs a clearer no-secret local workflow',
      evidence: 'The tool refuses to print or commit API key values; developers need obvious env-file and secret-management guidance.',
      recommendation: 'Add copy-paste safe examples that load JUPITER_API_KEY from environment variables and explicitly warn against committing keys.',
    });
  }

  if (!cliAvailable) {
    findings.push({
      severity: 'medium',
      title: 'Jupiter CLI was not immediately available in PATH',
      evidence: 'The project expects the @jup-ag/cli binary for agentic workflows.',
      recommendation: 'Document npm global install, npx usage, and version verification side-by-side.',
    });
  }

  for (const check of apiChecks ?? []) {
    if (!check.ok) {
      findings.push({
        severity: check.severity ?? 'medium',
        title: check.title,
        evidence: check.evidence,
        recommendation: check.recommendation,
      });
    }
  }

  return findings;
}
