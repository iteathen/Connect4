import { spawnSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { IsoMaxBranchManager } from '../../components/isometric/execution/branch-manager.mjs';
import { IsoMaxSurplusBranchManager } from '../../components/isometric/execution/surplus-manager.mjs';
import { makeCorpus } from '../isomax-ordering/corpus.mjs';

const hard = [
  '717657616532237625',
  '466537327657277224',
  '616767454664457417',
].map(sequence => Array.from(sequence, character => Number(character) - 1));

const late = makeCorpus({ seed:0x102c0, ply:28, count:3 }).map(entry => entry.moves);
const corpusName = process.env.ISOMAX_SURPLUS_CORPUS ?? 'late';
const roots = corpusName === 'hard' ? hard : corpusName === 'late' ? late : null;
if (!roots) throw new Error('invalid ISOMAX_SURPLUS_CORPUS: ' + corpusName);
const timeoutMs = corpusName === 'hard' ? 30000 : 15000;
const seq = moves => moves.map(column => column + 1).join('');

function sum(records, getter) {
  let value=0;
  for (const record of records) value += getter(record) ?? 0;
  return value;
}
function aggregate(records, profile) {
  const summary={
    totalMs:sum(records,r=>r.elapsedMs),
    resultReadyMs:sum(records,r=>r.resultReadyMs),
    cleanupMs:sum(records,r=>r.cleanupMs),
    maxRssBytes:Math.max(...records.map(r=>r.maxRssBytes??0)),
    failed:records.some(r=>r.failed),
    values:records.map(r=>[r.sequence,r.failed?'FAILED':r.value,r.failed?r.error:r.move]),
  };
  if(profile==='central'){
    summary.central={
      calls:sum(records,r=>r.metrics?.nodes),
      expandedEntries:sum(records,r=>r.metrics?.expandedEntries),
      transitionAttempts:sum(records,r=>r.metrics?.transitionAttempts),
      managerExpansions:sum(records,r=>r.metrics?.managerExpansions),
      submitted:sum(records,r=>r.metrics?.submitted),
      qReuses:sum(records,r=>r.metrics?.qReuses),
      retiredTaskNodes:sum(records,r=>r.metrics?.retiredTaskNodes),
    };
  } else if(profile==='surplus'){
    summary.surplus={
      calls:sum(records,r=>r.metrics?.worker?.nodes),
      expandedEntries:sum(records,r=>r.metrics?.worker?.expandedEntries),
      transitionAttempts:sum(records,r=>r.metrics?.worker?.transitionAttempts),
      transitionCacheStores:sum(records,r=>r.metrics?.worker?.transitionCacheStores),
      workClaims:sum(records,r=>r.metrics?.worker?.workClaims),
      branches:sum(records,r=>r.metrics?.worker?.branches),
      localPrimary:sum(records,r=>r.metrics?.worker?.localPrimary),
      surplusLocal:sum(records,r=>r.metrics?.worker?.surplusLocal),
      surplusRemote:sum(records,r=>r.metrics?.worker?.surplusRemote),
      helperWaits:sum(records,r=>r.metrics?.worker?.helperWaits),
      occurrencesPublished:sum(records,r=>r.metrics?.worker?.occurrencesPublished),
      occurrenceExactConsumed:sum(records,r=>r.metrics?.worker?.occurrenceExactConsumed),
      pathReplayApplies:sum(records,r=>r.metrics?.worker?.pathReplayApplies),
      controlChecks:sum(records,r=>r.metrics?.worker?.controlChecks),
      continuationYields:sum(records,r=>r.metrics?.worker?.continuationYields),
      remoteCacheTransitions:sum(records,r=>r.metrics?.worker?.remoteCacheTransitions),
      canonicalQMax:Math.max(...records.map(r=>r.metrics?.maxActiveCanonicalQ??0)),
      qHighWaterMax:Math.max(...records.map(r=>r.qHighWater??r.metrics?.qHighWater??0)),
      qReuses:sum(records,r=>r.metrics?.qReuses),
      qReclaims:sum(records,r=>r.metrics?.qReclaims),
      exactQEvictions:sum(records,r=>r.metrics?.exactQEvictions),
      canonicalWorkCreated:sum(records,r=>r.metrics?.canonicalWorkCreated),
      workSlotReclaims:sum(records,r=>r.metrics?.workSlotReclaims),
      duplicateOccurrences:sum(records,r=>r.metrics?.duplicateOccurrences),
      duplicateRunningContinuations:sum(records,r=>r.metrics?.duplicateRunningContinuations),
      exactBroadcasts:sum(records,r=>r.metrics?.exactBroadcasts),
      managerReplayApplies:sum(records,r=>r.metrics?.managerReplayApplies),
      managerReplayUndos:sum(records,r=>r.metrics?.managerReplayUndos),
      maxActiveWork:Math.max(...records.map(r=>r.metrics?.maxActiveWork??0)),
      maxOccurrences:Math.max(...records.map(r=>r.metrics?.maxOccurrences??0)),
    };
  } else {
    summary.serial={calls:sum(records,r=>r.metrics?.nodes)};
  }
  return summary;
}

async function runChild(variant) {
  const records=[];
  for (const moves of roots) {
    const sequence=seq(moves), started=performance.now();
    try {
      if (variant === 'serial') {
        const solved=new IsoMaxSolver().solveMoves(moves);
        records.push({
          sequence,value:solved.value,move:solved.move,metrics:solved.metrics,
          elapsedMs:performance.now()-started,resultReadyMs:performance.now()-started,cleanupMs:0,
          maxRssBytes:process.resourceUsage().maxRSS*1024,failed:false,
        });
        continue;
      }

      const [profile,workerText]=variant.split('-');
      const workers=Number(workerText);
      const Manager=profile==='central'?IsoMaxBranchManager:
        profile==='surplus'?IsoMaxSurplusBranchManager:null;
      if(!Manager)throw new Error('invalid comparison variant '+variant);
      const manager=new Manager({workers});
      try {
        const solved=await manager.solveMoves(moves,{timeoutMs});
        records.push({
          sequence,value:solved.value,move:solved.move,metrics:solved.metrics,
          elapsedMs:performance.now()-started,
          resultReadyMs:solved.resultReadyMs??solved.elapsedMs??(performance.now()-started),
          cleanupMs:solved.cleanupMs??0,
          qHighWater:solved.qHighWater??null,
          maxRssBytes:process.resourceUsage().maxRSS*1024,failed:false,
        });
      } catch (error) {
        records.push({
          sequence,failed:true,error:error?.message??String(error),
          elapsedMs:performance.now()-started,resultReadyMs:0,cleanupMs:0,
          metrics:manager.lastStats?.metrics??null,
          qHighWater:manager.lastStats?.qHighWater??null,
          maxRssBytes:process.resourceUsage().maxRSS*1024,
        });
      } finally {
        await manager.close().catch(()=>{});
      }
    } catch (error) {
      records.push({
        sequence,failed:true,error:error?.message??String(error),
        elapsedMs:performance.now()-started,resultReadyMs:0,cleanupMs:0,
        maxRssBytes:process.resourceUsage().maxRSS*1024,
      });
    }
  }
  process.stdout.write(JSON.stringify({variant,records})+'\n');
}

if (process.argv[2] === 'child') {
  await runChild(process.argv[3]);
} else {
  const variants=['serial','central-1','surplus-1','central-2','surplus-2','central-4','surplus-4'];
  const results={};
  for (const variant of variants) {
    const child=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'child',variant],{
      cwd:fileURLToPath(new URL('../../',import.meta.url)),
      encoding:'utf8',
      env:{...process.env,ISOMAX_SURPLUS_CORPUS:corpusName},
      timeout:(timeoutMs*roots.length)+30000,
      maxBuffer:16*1024*1024,
    });
    if(child.error)throw child.error;
    if(child.status!==0)throw new Error(variant+' comparison child failed: '+child.stderr);
    const payload=JSON.parse(child.stdout.trim().split('\n').filter(Boolean).at(-1));
    const profile=variant==='serial'?'serial':variant.startsWith('central-')?'central':'surplus';
    results[variant]=aggregate(payload.records,profile);
  }

  const baseline=results.serial.values;
  let sameExactDecisions=true;
  for (const variant of variants.slice(1)) {
    const valueRows=results[variant].values;
    if(results[variant].failed){sameExactDecisions=false;continue;}
    if(JSON.stringify(valueRows)!==JSON.stringify(baseline))sameExactDecisions=false;
  }

  const summary={
    kind:'surplus-comparison-summary',
    node:process.version,
    cpu:os.cpus()[0]?.model??null,
    corpus:corpusName,
    timeoutMsPerRoot:timeoutMs,
    roots:roots.map(seq),
    sameExactDecisions,
    variants:results,
    failedVariants:variants.filter(v=>results[v].failed),
  };
  process.stdout.write(JSON.stringify(summary)+'\n');
  if(!sameExactDecisions||summary.failedVariants.length)process.exitCode=1;
}
