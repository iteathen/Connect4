#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { caseId, computeMemoryAdmission, parseQualifierArgs } from './cuda-bsfp-qualifier/config.mjs';
import { getQualificationProfile } from './cuda-bsfp-qualifier/profiles.mjs';
import { collectGitIdentity, collectSystemSnapshot, queryNvidiaGpu } from './cuda-bsfp-qualifier/system.mjs';
import { parseJsonStdout, runLoggedChild } from './cuda-bsfp-qualifier/process.mjs';
import {
  buildPublishBundle,
  caseDirectory,
  createJournal,
  createRunId,
  finalizeRun,
  listRecoverableRuns,
  readJson,
  recoverInterruptedRun,
  writeJson,
} from './cuda-bsfp-qualifier/report.mjs';
import { publishQualificationBundle } from './cuda-bsfp-qualifier/github-publisher.mjs';

const repositoryRoot = process.cwd();

function resolveRepository(config, source) {
  return config.reportRepository || process.env.GITHUB_REPOSITORY || source.repository || 'iteathen/Connect4';
}

function resolveBase(config, source) {
  return config.reportBase || process.env.CUDA_BSFP_REPORT_BASE || source.branch || 'main';
}

function classifyChild(step, child) {
  if (child.memorySafetyAbort) return { status: 'memory-safety-abort', reason: 'emergency free-VRAM floor crossed during execution' };
  if (child.timedOut) return { status: 'timeout', reason: `step exceeded ${child.timeoutMs ?? 'configured'} timeout` };
  if (child.launchError) return { status: 'runtime-failure', reason: child.launchError };
  if (child.exitCode !== 0) return { status: 'runtime-failure', reason: `child exited ${child.exitCode ?? 'null'} signal ${child.signal ?? 'none'}` };
  const parsed = parseJsonStdout(child.stdoutTail);
  if (!parsed) return { status: 'runtime-failure', reason: 'child completed without a parseable JSON result' };
  if (!step.expected(parsed)) return { status: 'correctness-failure', reason: `step ${step.id} result did not satisfy C4-0009-Q1 expectations`, solverResult: parsed };
  return { status: 'passed', solverResult: parsed };
}

async function publishEntry(entry, repositoryRootOverride = repositoryRoot) {
  const state = entry.state ?? readJson(entry.statePath);
  const config = state.config;
  const repository = state.reportRepository;
  const baseRef = state.reportBase;
  const bundle = buildPublishBundle({ runDir: entry.runDir, repositoryRoot: repositoryRootOverride, maxLogBytes: config.limits.publishLogBytes });
  const results = readJson(path.join(entry.runDir, 'results.json'));
  const publication = await publishQualificationBundle({
    repository,
    baseRef,
    runId: state.runId,
    bundle,
    sourceRevision: state.sourceRevision,
    outcome: results.outcome,
  });
  state.publishStatus = 'published';
  state.publication = publication;
  state.publishedAt = new Date().toISOString();
  writeJson(entry.statePath, state);
  return publication;
}

async function recoverAndPublish(config) {
  const entries = listRecoverableRuns(config.spoolRoot);
  for (const raw of entries) {
    const entry = recoverInterruptedRun(raw);
    if (!config.publish || entry.state.config?.publish === false || entry.state.publishStatus === 'published') continue;
    try {
      await publishEntry(entry);
      console.error(`[cuda-bsfp-q1] recovered report published for ${entry.state.runId}`);
    } catch (error) {
      console.error(`[cuda-bsfp-q1] recovered report publication failed for ${entry.state.runId}: ${error.message}`);
    }
  }
}

async function main() {
  const config = parseQualifierArgs();
  const source = await collectGitIdentity(repositoryRoot);
  const reportRepository = resolveRepository(config, source);
  const reportBase = resolveBase(config, source);
  await recoverAndPublish(config);

  const runId = createRunId();
  const journal = createJournal({
    spoolRoot: config.spoolRoot,
    runId,
    initialState: {
      schemaVersion: 1,
      profile: config.profile,
      sourceRevision: source.revision,
      reportRepository,
      reportBase,
      config,
    },
  });

  let system = null;
  const caseResults = [];
  let fatalFailure = null;
  let stopReason = null;
  const runDeadline = Date.now() + config.limits.runTimeoutMs;

  try {
    system = await collectSystemSnapshot({ repositoryRoot, spoolRoot: config.spoolRoot, gpuIndex: config.gpuIndex });
    writeJson(path.join(journal.runDir, 'system.preflight.json'), system);
    journal.appendEvent({ type: 'system-snapshot-captured', gpuAvailable: system.gpu.available });
    const profile = getQualificationProfile(config.profile);
    if (config.publish) {
      const environmentProblems = [];
      if (!system.source?.revision || system.source?.dirty !== false) {
        environmentProblems.push('official qualification requires a clean Git source checkout with a discoverable revision');
      }
      const required = profile.requiredDependencies;
      if (required?.cudaAlgorithmsRevision && system.dependencies?.cudaAlgorithms?.revision !== required.cudaAlgorithmsRevision) {
        environmentProblems.push(`CUDA-Algorithms revision must be ${required.cudaAlgorithmsRevision}, got ${system.dependencies?.cudaAlgorithms?.revision ?? 'unknown'}`);
      }
      if (required?.cudaJsRevision && system.dependencies?.cudaJs?.revision !== required.cudaJsRevision) {
        environmentProblems.push(`CUDA-JS revision must be ${required.cudaJsRevision}, got ${system.dependencies?.cudaJs?.revision ?? 'unknown'}`);
      }
      if (environmentProblems.length > 0) {
        throw new Error(`official qualification environment refused: ${environmentProblems.join('; ')}`);
      }
    }

    for (let index = 0; index < config.cases.length; index += 1) {
      const geometry = config.cases[index];
      const casePaths = caseDirectory(journal.runDir, index, geometry);
      const estimate = profile.estimate(geometry);
      const baseResult = {
        caseId: casePaths.id,
        geometry,
        profile: profile.id,
        estimate,
        status: 'planned',
        durationMs: 0,
        steps: [],
      };
      writeJson(path.join(casePaths.dir, 'case.json'), baseResult);
      journal.appendEvent({ type: 'case-planned', caseId: casePaths.id, geometry, estimate });

      if (stopReason && !config.continueAfterBoundary) {
        const result = { ...baseResult, status: 'skipped-after-boundary', reason: stopReason };
        writeJson(path.join(casePaths.dir, 'result.json'), result);
        caseResults.push(result);
        continue;
      }

      if (!profile.supports(geometry)) {
        const result = { ...baseResult, status: 'unsupported-profile', reason: `${profile.id} does not implement ${caseId(geometry)}` };
        writeJson(path.join(casePaths.dir, 'result.json'), result);
        caseResults.push(result);
        continue;
      }

      if (config.dryRun) {
        const result = { ...baseResult, status: 'dry-run-admission-only', reason: 'execution disabled by --dry-run' };
        writeJson(path.join(casePaths.dir, 'result.json'), result);
        caseResults.push(result);
        continue;
      }

      const gpu = await queryNvidiaGpu(config.gpuIndex);
      const admission = computeMemoryAdmission({
        estimatedBytes: estimate.upperBoundBytes,
        freeMiB: gpu.available ? gpu.freeMiB : Number.NaN,
        limits: config.limits,
      });
      writeJson(path.join(casePaths.dir, 'admission.json'), { gpu, admission });
      journal.appendEvent({ type: 'case-memory-admission', caseId: casePaths.id, gpu, admission });
      if (!admission.allowed) {
        const result = { ...baseResult, status: 'memory-safety-refusal', reason: admission.reason, admission };
        writeJson(path.join(casePaths.dir, 'result.json'), result);
        caseResults.push(result);
        if (admission.reason === 'free-vram-telemetry-unavailable') stopReason = 'GPU memory telemetry unavailable; later GPU cases were not launched';
        continue;
      }

      const caseStarted = Date.now();
      let caseStatus = 'passed';
      let caseReason = null;
      let solverResult = null;
      for (const step of profile.steps(geometry, repositoryRoot)) {
        const remainingRunMs = runDeadline - Date.now();
        const remainingCaseMs = config.limits.caseTimeoutMs - (Date.now() - caseStarted);
        const timeoutMs = Math.max(1, Math.min(remainingRunMs, remainingCaseMs));
        if (remainingRunMs <= 0 || remainingCaseMs <= 0) {
          caseStatus = 'timeout';
          caseReason = remainingRunMs <= 0 ? 'overall qualification timeout reached' : 'per-case timeout reached';
          stopReason = caseReason;
          break;
        }

        const stepDir = path.join(casePaths.dir, step.id);
        const stdoutPath = path.join(stepDir, 'stdout.log');
        const stderrPath = path.join(stepDir, 'stderr.log');
        journal.appendEvent({ type: 'step-started', caseId: casePaths.id, stepId: step.id, timeoutMs });
        const child = await runLoggedChild({
          command: step.command,
          args: step.args,
          cwd: repositoryRoot,
          stdoutPath,
          stderrPath,
          timeoutMs,
          gpuIndex: config.gpuIndex,
          emergencyFreeMiB: config.limits.emergencyFreeMiB,
          sampleIntervalMs: config.limits.gpuSampleIntervalMs,
          onEvent(event) { journal.appendEvent({ ...event, caseId: casePaths.id, stepId: step.id }); },
        });
        const classified = classifyChild(step, { ...child, timeoutMs });
        const stepResult = { stepId: step.id, ...child, ...classified, stdoutTail: undefined, stderrTail: undefined };
        writeJson(path.join(stepDir, 'result.json'), stepResult);
        baseResult.steps.push(stepResult);
        journal.appendEvent({ type: 'step-finished', caseId: casePaths.id, stepId: step.id, status: classified.status, durationMs: child.durationMs });
        if (classified.solverResult) solverResult = classified.solverResult;
        if (classified.status !== 'passed') {
          caseStatus = classified.status;
          caseReason = classified.reason;
          if (['timeout', 'memory-safety-abort', 'runtime-failure', 'correctness-failure'].includes(caseStatus)) stopReason = `${casePaths.id}: ${caseStatus}`;
          break;
        }
      }

      const result = {
        ...baseResult,
        status: caseStatus,
        reason: caseReason,
        durationMs: Date.now() - caseStarted,
        solverResult,
      };
      writeJson(path.join(casePaths.dir, 'result.json'), result);
      caseResults.push(result);
      journal.appendEvent({ type: 'case-finished', caseId: casePaths.id, status: caseStatus, durationMs: result.durationMs });
    }
  } catch (error) {
    fatalFailure = { kind: 'qualifier-runtime-failure', message: error?.message ?? String(error), stack: error?.stack ?? null };
    journal.appendEvent({ type: 'qualifier-runtime-failure', message: fatalFailure.message });
  }

  const hasHardFailure = fatalFailure || caseResults.some((result) => ['correctness-failure', 'runtime-failure'].includes(result.status));
  const hasBoundary = caseResults.some((result) => ['timeout', 'memory-safety-abort', 'memory-safety-refusal', 'unsupported-profile', 'skipped-after-boundary'].includes(result.status));
  const outcome = hasHardFailure ? 'failed' : config.dryRun ? 'dry-run' : hasBoundary ? 'complete-with-boundaries' : 'qualified';
  finalizeRun({ journal, system: system ?? { source }, config: { ...config, reportRepository, reportBase }, cases: caseResults, outcome, failure: fatalFailure });

  let publication = null;
  let publicationError = null;
  if (config.publish) {
    try {
      publication = await publishEntry({ runDir: journal.runDir, statePath: journal.statePath, state: journal.state });
      journal.appendEvent({ type: 'report-published', publication });
    } catch (error) {
      publicationError = error;
      journal.updateState({ publishStatus: 'failed', publicationError: error.message });
      journal.appendEvent({ type: 'report-publication-failed', message: error.message });
    }
  } else {
    journal.updateState({ publishStatus: 'disabled' });
  }

  const final = {
    runId,
    outcome,
    localReport: journal.runDir,
    publication,
    publicationError: publicationError?.message ?? null,
    caseStatuses: caseResults.map((result) => ({ caseId: result.caseId, status: result.status })),
  };
  console.log(JSON.stringify(final, null, 2));

  if (publicationError) process.exitCode = 3;
  else if (hasHardFailure) process.exitCode = 2;
  else process.exitCode = 0;
}

main().catch((error) => {
  console.error(error?.stack ?? error?.message ?? String(error));
  process.exitCode = 4;
});
