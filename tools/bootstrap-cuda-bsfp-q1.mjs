#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const CONNECT4_REPOSITORY = 'https://github.com/iteathen/Connect4.git';
const CUDA_ALGORITHMS_REPOSITORY = 'https://github.com/iteathen/CUDA-Algorithms.git';
const CUDA_JS_REPOSITORY = 'https://github.com/iteathen/CUDA-JS.git';

export const DEFAULT_REVISIONS = Object.freeze({
  connect4: 'feature/cuda-bsfp',
  cudaAlgorithms: '48ee0aec9acae7776950f03ab52ab1737e598b6e',
  cudaJs: '98e2ebc942c14d63acf4dd82e912dd548c363a05',
});

function exec(command, args, options = {}) {
  return execFileSync(command, args, {
    stdio: 'inherit',
    windowsHide: true,
    ...options,
  });
}

function shell(command, cwd, env = process.env) {
  if (process.platform === 'win32') {
    return exec(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', command], { cwd, env });
  }
  return exec('/bin/sh', ['-lc', command], { cwd, env });
}

function linkDirectory(target, linkPath) {
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  try {
    fs.rmSync(linkPath, { recursive: true, force: true });
  } catch {}
  fs.symlinkSync(target, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
}

export function wireQualificationWorkspace({ workspaceRoot, connect4Root, cudaAlgorithmsRoot, cudaJsRoot }) {
  const sharedNodeModules = path.join(workspaceRoot, 'node_modules');
  const connect4NodeModules = path.join(connect4Root, 'node_modules');
  fs.mkdirSync(sharedNodeModules, { recursive: true });
  fs.mkdirSync(connect4NodeModules, { recursive: true });

  linkDirectory(cudaJsRoot, path.join(sharedNodeModules, 'cuda-js'));
  linkDirectory(cudaAlgorithmsRoot, path.join(sharedNodeModules, 'cuda-algorithms'));

  linkDirectory(cudaJsRoot, path.join(connect4NodeModules, 'cuda-js'));
  linkDirectory(cudaAlgorithmsRoot, path.join(connect4NodeModules, 'cuda-algorithms'));

  return Object.freeze({
    sharedNodeModules,
    connect4NodeModules,
    cudaJsPackage: path.join(connect4NodeModules, 'cuda-js'),
    cudaAlgorithmsPackage: path.join(connect4NodeModules, 'cuda-algorithms'),
  });
}

export function qualificationNodeOptions(existing = process.env.NODE_OPTIONS ?? '') {
  const flag = '--experimental-ffi';
  const tokens = existing.trim() ? existing.trim().split(/\s+/) : [];
  if (process.allowedNodeEnvironmentFlags?.has(flag) && !tokens.includes(flag)) tokens.push(flag);
  return tokens.join(' ');
}

function uniqueWorkspace(baseDirectory) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  let candidate = path.resolve(baseDirectory, `Connect4-BSFP-Q1-work-${stamp}`);
  let suffix = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.resolve(baseDirectory, `Connect4-BSFP-Q1-work-${stamp}-${suffix}`);
    suffix += 1;
  }
  return candidate;
}

function parseArgs(argv) {
  const config = {
    workspace: null,
    prepareOnly: false,
    connect4Ref: DEFAULT_REVISIONS.connect4,
    cudaAlgorithmsRef: DEFAULT_REVISIONS.cudaAlgorithms,
    cudaJsRef: DEFAULT_REVISIONS.cudaJs,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--prepare-only') config.prepareOnly = true;
    else if (arg === '--workspace') config.workspace = path.resolve(argv[++index]);
    else if (arg === '--connect4-ref') config.connect4Ref = argv[++index];
    else if (arg === '--cuda-algorithms-ref') config.cudaAlgorithmsRef = argv[++index];
    else if (arg === '--cuda-js-ref') config.cudaJsRef = argv[++index];
    else throw new RangeError(`unknown bootstrap argument: ${arg}`);
  }

  return config;
}

function cloneAndCheckout(repository, destination, ref) {
  exec('git', ['clone', repository, destination]);
  exec('git', ['-C', destination, 'checkout', ref]);
}

function discoverGhToken() {
  if (process.env.CUDA_BSFP_GITHUB_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN) return null;
  const result = spawnSync('gh', ['auth', 'token'], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 5000,
  });
  if (result.status === 0 && result.stdout?.trim()) return result.stdout.trim();
  return null;
}

export function resolvePackageFrom(baseDirectory, packageName) {
  const probePath = path.join(baseDirectory, `.cuda-bsfp-resolution-probe-${process.pid}-${Date.now()}.mjs`);
  const source = `console.log(import.meta.resolve(${JSON.stringify(packageName)}));\n`;
  fs.writeFileSync(probePath, source, 'utf8');
  try {
    return execFileSync(process.execPath, [probePath], {
      cwd: baseDirectory,
      encoding: 'utf8',
      windowsHide: true,
      timeout: 10000,
    }).trim();
  } finally {
    fs.rmSync(probePath, { force: true });
  }
}

export async function main(argv = process.argv.slice(2)) {
  const config = parseArgs(argv);
  const workspaceRoot = config.workspace ?? uniqueWorkspace(process.cwd());
  if (fs.existsSync(workspaceRoot)) throw new Error(`workspace already exists: ${workspaceRoot}`);
  fs.mkdirSync(workspaceRoot, { recursive: true });

  const connect4Root = path.join(workspaceRoot, 'Connect4');
  const cudaAlgorithmsRoot = path.join(workspaceRoot, 'CUDA-Algorithms');
  const cudaJsRoot = path.join(workspaceRoot, 'CUDA-JS');

  console.error(`[cuda-bsfp-q1-bootstrap] Node ${process.version}`);
  console.error(`[cuda-bsfp-q1-bootstrap] workspace ${workspaceRoot}`);

  cloneAndCheckout(CONNECT4_REPOSITORY, connect4Root, config.connect4Ref);
  cloneAndCheckout(CUDA_ALGORITHMS_REPOSITORY, cudaAlgorithmsRoot, config.cudaAlgorithmsRef);
  cloneAndCheckout(CUDA_JS_REPOSITORY, cudaJsRoot, config.cudaJsRef);

  const env = { ...process.env, npm_config_engine_strict: 'false' };
  const nodeOptions = qualificationNodeOptions(env.NODE_OPTIONS);
  if (nodeOptions) env.NODE_OPTIONS = nodeOptions;
  else delete env.NODE_OPTIONS;

  shell('npm ci --no-audit --no-fund', cudaJsRoot, env);
  const topology = wireQualificationWorkspace({ workspaceRoot, connect4Root, cudaAlgorithmsRoot, cudaJsRoot });

  const resolvedCudaJsFromAlgorithms = resolvePackageFrom(path.join(cudaAlgorithmsRoot, 'src'), 'cuda-js');
  const resolvedCudaAlgorithmsFromConnect4 = resolvePackageFrom(connect4Root, 'cuda-algorithms');
  if (!resolvedCudaJsFromAlgorithms.includes('CUDA-JS')) {
    throw new Error(`CUDA-Algorithms did not resolve the sibling CUDA-JS checkout: ${resolvedCudaJsFromAlgorithms}`);
  }
  if (!resolvedCudaAlgorithmsFromConnect4.includes('CUDA-Algorithms')) {
    throw new Error(`Connect4 did not resolve the sibling CUDA-Algorithms checkout: ${resolvedCudaAlgorithmsFromConnect4}`);
  }

  const connect4Status = execFileSync('git', ['-C', connect4Root, 'status', '--porcelain'], {
    encoding: 'utf8',
    windowsHide: true,
  }).trim();
  if (connect4Status.length > 0) throw new Error(`bootstrap dirtied the Connect4 checkout:\n${connect4Status}`);

  console.error('[cuda-bsfp-q1-bootstrap] package topology verified');
  console.error(`[cuda-bsfp-q1-bootstrap] cuda-js -> ${resolvedCudaJsFromAlgorithms}`);
  console.error(`[cuda-bsfp-q1-bootstrap] cuda-algorithms -> ${resolvedCudaAlgorithmsFromConnect4}`);
  console.error(`[cuda-bsfp-q1-bootstrap] experimental FFI flag ${process.allowedNodeEnvironmentFlags?.has('--experimental-ffi') ? 'enabled for Q1 children' : 'not available on this Node build'}`);

  if (config.prepareOnly) {
    console.log(JSON.stringify({
      outcome: 'prepared',
      nodeVersion: process.version,
      nodeOptions: env.NODE_OPTIONS ?? '',
      experimentalFfiEnabled: process.allowedNodeEnvironmentFlags?.has('--experimental-ffi') === true,
      workspaceRoot,
      connect4Root,
      cudaAlgorithmsRoot,
      cudaJsRoot,
      topology,
    }, null, 2));
    return;
  }

  const discoveredToken = discoverGhToken();
  if (discoveredToken) env.GH_TOKEN = discoveredToken;
  if (!env.CUDA_BSFP_GITHUB_TOKEN && !env.GITHUB_TOKEN && !env.GH_TOKEN) {
    console.error('[cuda-bsfp-q1-bootstrap] no GitHub publication token discovered; Q1 will preserve local evidence and report publication failure');
  }

  exec(process.execPath, ['tools/cuda-bsfp-qualifier.mjs', '--qualify-benchmark'], {
    cwd: connect4Root,
    env,
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    console.error(error?.stack ?? error?.message ?? String(error));
    process.exitCode = 1;
  });
}
