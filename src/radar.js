export function scoreTokens(tokens) {
  return [...tokens].map((token) => {
    const reasons = [];
    let riskScore = 0;

    if (!token.isVerified) {
      riskScore += 35;
      reasons.push('unverified token');
    }

    if ((token.organicScore ?? 0) < 50) {
      riskScore += 25;
      reasons.push(`low organic score (${token.organicScore ?? 'missing'})`);
    }

    if ((token.liquidity ?? 0) < 10000) {
      riskScore += 25;
      reasons.push(`thin liquidity (${formatNumber(token.liquidity ?? 0)})`);
    }

    if ((token.holderCount ?? 0) > 0 && token.holderCount < 100) {
      riskScore += 10;
      reasons.push(`small holder base (${token.holderCount})`);
    }

    return {
      symbol: token.symbol ?? token.id ?? 'UNKNOWN',
      name: token.name ?? '',
      price: token.usdPrice,
      liquidity: token.liquidity,
      isVerified: Boolean(token.isVerified),
      organicScore: token.organicScore,
      riskScore,
      reasons: reasons.length ? reasons : ['major/verified token profile'],
    };
  }).sort((a, b) => b.riskScore - a.riskScore || a.symbol.localeCompare(b.symbol));
}

export function buildRadar({ generatedAt, tokens, quote }) {
  const scored = scoreTokens(tokens);
  const quoteLine = quote
    ? `${quote.inputToken?.symbol ?? 'input'} → ${quote.outputToken?.symbol ?? 'output'}: ${quote.inAmount} for ${quote.outAmount}; price impact ${quote.priceImpact}`
    : 'No quote captured.';

  return `# Jupiter Friction Radar\n\nGenerated: ${generatedAt}\n\n## Quote check\n\n${quoteLine}\n\n## Token risk snapshot\n\n| Token | Risk | Verified | Organic Score | Liquidity | Reasons |\n|---|---:|---|---:|---:|---|\n${scored.map((token) => `| ${token.symbol} | ${token.riskScore} | ${token.isVerified ? 'yes' : 'no'} | ${token.organicScore ?? ''} | ${formatNumber(token.liquidity ?? 0)} | ${token.reasons.join('; ')} |`).join('\n')}\n\n## Why this exists\n\nThis is intentionally small: it uses Jupiter developer tooling to generate a concrete artifact while documenting where an AI-assisted developer hits friction.\n`;
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
}
