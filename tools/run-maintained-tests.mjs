#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = [
  'benchmarks/test',
  'components/domain/test',
  'components/incumbent/test',
  'components/oracle/test',
];

const files = [];
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
      files.push(path.join(root, entry.name));
    }
  }
}

files.sort();
if (files.length === 0) {
  console.error('No maintained tests found.');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
