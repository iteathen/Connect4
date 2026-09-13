#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const CONNECT4_REPOSITORY = 'https://github.com/iteathen/Connect4.git';
const CUDA_ALGORITHMS_REPOSITORY = 'https://github.com/iteathen/CUDA-Algorithms.git';
const CUDA_JS_REPOSITORY = 'https://github.com/iteathen/CUDA-JS.git';
const LOCAL_PATH_PLACEHOLDER = '[local-path]';
const localPathRoots = new Set();

export const DEFAULT_REVISIONS = Object.freeze({
  connect4: 'solver/cuda-bsfp',
  cudaAlgorithms: '48ee0aec9acae7776950f03ab52ab1737e598b6e',
  cudaJs: '98e2ebc942c14d63acf4dd82e912dd548c363a05',
});

function registerLocalPath(value) {
  if (typeof value !== 'string' || value.length === 0) return;
  const absolute = path.resolve(value);
  localPathRoots.add(absolute);
  localPathRoots.add(pathToFileURL(absolute).href.replace(/\/$/, ''));
}

for (const value of [process.cwd(), os.homedir(), os.tmpdir(), path.dirname(process.execPath)]) {
  registerLocalPath(value);
}

export function redactLocalPaths(value) {
  let text = String(value ?? '');
  const roots = [...localPathRoots].sort((left, right) => right.length - left.length);
  for (const root of roots) text = text.split(root).join(LOCAL_PATH_PLACEHOLDER);

  // Defense in depth for absolute paths outside the registered workspace/home/temp roots.
  text = text.replace(/file:\/\/\/(?:[A-Za-z]:\/|\/)[^\s"'`<>]*/g, LOCAL_PATH_PLACEHOLDER);
  text = text.replace(/(^|[\s"'`(=])(?:[A-Za-z]:[\\/])[^\s"'`<>]*/gm, `$1${LOCAL_PATH_PLACEHOLDER}`);
  text = text.replace(/(^|[\s"'`(=])\\\\[^\s"'`<>]*/gm, `$1${LOCAL_PATH_PLACEHOLDER}`);
  text = text.replace(/(^|[\s"'`(=:])\/(?!\/)[^\s"'`<>]*/gm, `$1${LOCAL_PATH_PLACEHOLDER}`);
  return text;
}

function writeSanitized(stream, text) {
  if (text) stream.write(redactLocalPaths(text));
}

function runFile(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
  writeSanitized(process.stdout, result.stdout);
  writeSanitized(process.stderr, result.stderr);
  if (result.error) throw new Error(`${path.basename(command)} launch failed: ${redactLocalPaths(result.error.message)}`);
  if (result.status !== 0) throw new Error(`${path.basename(command)} exited with status ${result.status ?? 'unknown'}`);
  return result.stdout ?? '';
}

function execGit(args, options = {}) {
  return runFile('git', args, options);
}

function execNode(args, options = {}) {
  return runFile(process.execPath, args, options);
}

function installCudaJsDependencies(cwd, env) {
  if (process.platform === 'win32') {
    return runFile('cmd.exe', ['/d', '/s', '/c', 'npm ci --no-audit --no-fund'], { cwd, env });
  }
  return runFile('npm', ['ci', '--no-audit', '--no-fund'], { cwd, env });
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
    q1Profile: null,
    q1Cases: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--prepare-only') config.prepareOnly = true;
    else if (arg === '--workspace') config.workspace = path.resolve(argv[++index]);
    else if (arg === '--connect4-ref') config.connect4Ref = argv[++index];
    else if (arg === '--cuda-algorithms-ref') config.cudaAlgorithmsRef = argv[++index];
    else if (arg === '--cuda-js-ref') config.cudaJsRef = argv[++index];
    else if (arg === '--q1-profile') config.q1Profile = argv[++index];
    else if (arg === '--q1-cases') config.q1Cases = argv[++index];
    else throw new RangeError(`unknown bootstrap argument: ${arg}`);
  }

  return config;
}

function cloneAndCheckout(repository, destination, ref) {
  execGit(['clone', repository, destination]);
  execGit(['-C', destination, 'checkout', ref]);
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
  registerLocalPath(workspaceRoot);
  if (fs.existsSync(workspaceRoot)) throw new Error('workspace already exists; choose a new --workspace destination');
  fs.mkdirSync(workspaceRoot, { recursive: true });

  const connect4Root = path.join(workspaceRoot, 'Connect4');
  const cudaAlgorithmsRoot = path.join(workspaceRoot, 'CUDA-Algorithms');
  const cudaJsRoot = path.join(workspaceRoot, 'CUDA-JS');
  registerLocalPath(connect4Root);
  registerLocalPath(cudaAlgorithmsRoot);
  registerLocalPath(cudaJsRoot);

  console.error(`[cuda-bsfp-q1-bootstrap] Node ${process.version}`);

  cloneAndCheckout(CONNECT4_REPOSITORY, connect4Root, config.connect4Ref);
  cloneAndCheckout(CUDA_ALGORITHMS_REPOSITORY, cudaAlgorithmsRoot, config.cudaAlgorithmsRef);
  cloneAndCheckout(CUDA_JS_REPOSITORY, cudaJsRoot, config.cudaJsRef);

  const env = { ...process.env, npm_config_engine_strict: 'false' };
  const nodeOptions = qualificationNodeOptions(env.NODE_OPTIONS);
  if (nodeOptions) env.NODE_OPTIONS = nodeOptions;
  else delete env.NODE_OPTIONS;

  installCudaJsDependencies(cudaJsRoot, env);
  wireQualificationWorkspace({ workspaceRoot, connect4Root, cudaAlgorithmsRoot, cudaJsRoot });

  const resolvedCudaJsFromAlgorithms = resolvePackageFrom(path.join(cudaAlgorithmsRoot, 'src'), 'cuda-js');
  const resolvedCudaAlgorithmsFromConnect4 = resolvePackageFrom(connect4Root, 'cuda-algorithms');
  if (!resolvedCudaJsFromAlgorithms.includes('CUDA-JS')) {
    throw new Error('CUDA-Algorithms did not resolve the sibling CUDA-JS checkout');
  }
  if (!resolvedCudaAlgorithmsFromConnect4.includes('CUDA-Algorithms')) {
    throw new Error('Connect4 did not resolve the sibling CUDA-Algorithms checkout');
  }

  const connect4Status = execFileSync('git', ['-C', connect4Root, 'status', '--porcelain'], {
    encoding: 'utf8',
    windowsHide: true,
  }).trim();
  if (connect4Status.length > 0) throw new Error(`bootstrap dirtied the Connect4 checkout:\n${redactLocalPaths(connect4Status)}`);

  const experimentalFfiEnabled = process.allowedNodeEnvironmentFlags?.has('--experimental-ffi') === true;
  console.error('[cuda-bsfp-q1-bootstrap] package topology verified');
  console.error('[cuda-bsfp-q1-bootstrap] cuda-js sibling resolution verified');
  console.error('[cuda-bsfp-q1-bootstrap] cuda-algorithms sibling resolution verified');
  console.error(`[cuda-bsfp-q1-bootstrap] experimental FFI flag ${experimentalFfiEnabled ? 'enabled for Q1 children' : 'not available on this Node build'}`);

  if (config.prepareOnly) {
    console.log(redactLocalPaths(JSON.stringify({
      outcome: 'prepared',
      nodeVersion: process.version,
      nodeOptions: experimentalFfiEnabled ? '--experimental-ffi' : '',
      experimentalFfiEnabled,
      revisions: {
        connect4: config.connect4Ref,
        cudaAlgorithms: config.cudaAlgorithmsRef,
        cudaJs: config.cudaJsRef,
      },
      q1Profile: config.q1Profile,
      q1Cases: config.q1Cases,
      topologyVerified: true,
    }, null, 2)));
    return;
  }

  const discoveredToken = discoverGhToken();
  if (discoveredToken) env.GH_TOKEN = discoveredToken;
  if (!env.CUDA_BSFP_GITHUB_TOKEN && !env.GITHUB_TOKEN && !env.GH_TOKEN) {
    console.error('[cuda-bsfp-q1-bootstrap] no GitHub publication token discovered; Q1 will preserve local evidence and report publication failure');
  }

  const qualifierArgs = ['tools/cuda-bsfp-qualifier.mjs', '--qualify-benchmark'];
  if (config.q1Profile) qualifierArgs.push('--profile', config.q1Profile);
  if (config.q1Cases) qualifierArgs.push('--cases', config.q1Cases);
  execNode(qualifierArgs, {
    cwd: connect4Root,
    env,
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    console.error(redactLocalPaths(error?.stack ?? error?.message ?? String(error)));
    process.exitCode = 1;
  });
}
