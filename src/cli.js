#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildRadar } from './radar.js';

function runJup(args) {
  const output = execFileSync('jup', [...args, '--format', 'json'], { encoding: 'utf8' });
  return JSON.parse(output);
}

const generatedAt = new Date().toISOString();
const tokenQuery = process.argv[2] ?? 'SOL';
const outputPath = resolve(process.argv[3] ?? 'artifacts/friction-radar.md');

const tokens = runJup(['spot', 'tokens', '--search', tokenQuery, '--limit', '5']);
const quote = runJup(['spot', 'quote', '--from', 'SOL', '--to', 'USDC', '--amount', '0.01']);
const markdown = buildRadar({ generatedAt, tokens, quote });

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, markdown);
console.log(JSON.stringify({ outputPath, tokenCount: tokens.length, generatedAt }, null, 2));
