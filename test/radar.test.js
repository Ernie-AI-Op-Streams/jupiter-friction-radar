import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreTokens, buildRadar } from '../src/radar.js';

const sampleTokens = [
  { symbol: 'SOL', isVerified: true, organicScore: 98, liquidity: 1000000, usdPrice: 86 },
  { symbol: 'ODD', isVerified: false, organicScore: 12, liquidity: 500, usdPrice: 0.01 },
];

test('scoreTokens ranks low-liquidity unverified tokens as higher risk', () => {
  const scores = scoreTokens(sampleTokens);
  assert.equal(scores[0].symbol, 'ODD');
  assert.ok(scores[0].riskScore > scores[1].riskScore);
  assert.match(scores[0].reasons.join(' '), /unverified/i);
});

test('buildRadar produces markdown with quote and token sections', () => {
  const markdown = buildRadar({
    generatedAt: '2026-04-25T00:00:00Z',
    tokens: sampleTokens,
    quote: { inputToken: { symbol: 'SOL' }, outputToken: { symbol: 'USDC' }, inAmount: '0.01', outAmount: '0.86', priceImpact: -0.01 },
  });
  assert.match(markdown, /# Jupiter Friction Radar/);
  assert.match(markdown, /SOL → USDC/);
  assert.match(markdown, /ODD/);
});
