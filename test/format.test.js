import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizePriceResponse, buildFindings } from '../src/report.js';

test('summarizePriceResponse extracts token prices from Jupiter response shapes', () => {
  const summary = summarizePriceResponse({ data: { SOL: { id: 'SOL', price: 123.45 }, USDC: { id: 'USDC', price: 1 } } });
  assert.deepEqual(summary, [
    { symbol: 'SOL', price: 123.45 },
    { symbol: 'USDC', price: 1 },
  ]);
});

test('buildFindings flags missing API key without exposing secrets', () => {
  const findings = buildFindings({ hasApiKey: false, cliAvailable: true, apiChecks: [] });
  assert.equal(findings.some((finding) => finding.title.includes('API key')), true);
  assert.equal(JSON.stringify(findings).includes('jup_'), false);
});
