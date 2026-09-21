import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { IsoMaxSolver } from '../../components/isometric/solver.mjs';
import { IsoMaxSurplusBranchManager } from '../../components/isometric/execution/surplus-manager.mjs';

const roots=[
  '717657616532237625',
  '466537327657277224',
  '616767454664457417',
].map(sequence=>Array.from(sequence,c=>Number(c)-1));
const seq=moves=>moves.map(c=>c+1).join('');
const quanta=(process.env.ISOMAX_SURPLUS_HELPER_QUANTA??'64,128,256,512,1024').split(',').map(Number);
const workers=(process.env.ISOMAX_SURPLUS_WORKERS??'2,4').split(',').map(Number);
for(const value of [...quanta,...workers])if(!Number.isSafeInteger(value)||value<1)throw new Error('invalid sweep value');

function sum(records,getter){let n=0;for(const r of records)n+=getter(r)??0;return n;}
function max(records,getter){let n=0;for(const r of records)n=Math.max(n,getter(r)??0);return n;}

async function child(workerCount,helperControlQuantum){
  const records=[];
  for(const moves of roots){
    const expected=new IsoMaxSolver().solveMoves(moves);
    const manager=new IsoMaxSurplusBranchManager({
      workers:workerCount,controlQuantum:512,helperControlQuantum,
    });
    const started=performance.now();
    try{
      const solved=await manager.solveMoves(moves,{timeoutMs:30000});
      records.push({
        sequence:seq(moves),value:solved.value,move:solved.move,
        expectedValue:expected.value,expectedMove:expected.move,
        resultReadyMs:solved.resultReadyMs,elapsedMs:performance.now()-started,
        calls:solved.metrics?.worker?.nodes??0,
        expandedEntries:solved.metrics?.worker?.expandedEntries??0,
        retirementWasteNodes:solved.metrics?.worker?.retirementWasteNodes??0,
        controlChecks:solved.metrics?.worker?.controlChecks??0,
        surplusRemoteClaims:solved.metrics?.worker?.surplusRemote??0,
        localReclaims:solved.metrics?.worker?.surplusLocal??0,
        helperWaits:solved.metrics?.worker?.helperWaits??0,
        helperReplayApplies:solved.metrics?.worker?.helperReplayApplies??0,
        demandReservations:solved.metrics?.worker?.demandReservations??0,
        occurrencesPublished:solved.metrics?.worker?.occurrencesPublished??0,
        managerReplayApplies:solved.metrics?.managerReplayApplies??0,
        maxActiveWork:solved.metrics?.maxActiveWork??0,
        maxRssBytes:process.resourceUsage().maxRSS*1024,
        failed:false,
      });
    }catch(error){
      records.push({
        sequence:seq(moves),failed:true,error:error?.message??String(error),
        elapsedMs:performance.now()-started,
      });
    }finally{await manager.close().catch(()=>{});}
  }
  process.stdout.write(JSON.stringify({workerCount,helperControlQuantum,records})+'\n');
}

if(process.argv[2]==='child'){
  await child(Number(process.argv[3]),Number(process.argv[4]));
}else{
  const results=[];
  for(const workerCount of workers)for(const helperControlQuantum of quanta){
    const run=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'child',String(workerCount),String(helperControlQuantum)],{
      cwd:fileURLToPath(new URL('../../',import.meta.url)),
      encoding:'utf8',timeout:150000,maxBuffer:8*1024*1024,env:{...process.env},
    });
    if(run.error)throw run.error;
    if(run.status!==0)throw new Error('helper quantum sweep child failed: '+run.stderr);
    const payload=JSON.parse(run.stdout.trim().split('\n').filter(Boolean).at(-1));
    const records=payload.records;
    const failed=records.some(r=>r.failed||r.value!==r.expectedValue||r.move!==r.expectedMove);
    results.push({
      workerCount,helperControlQuantum,failed,
      resultReadyMs:sum(records,r=>r.resultReadyMs),
      elapsedMs:sum(records,r=>r.elapsedMs),
      calls:sum(records,r=>r.calls),
      expandedEntries:sum(records,r=>r.expandedEntries),
      retirementWasteNodes:sum(records,r=>r.retirementWasteNodes),
      controlChecks:sum(records,r=>r.controlChecks),
      surplusRemoteClaims:sum(records,r=>r.surplusRemoteClaims),
      localReclaims:sum(records,r=>r.localReclaims),
      helperWaits:sum(records,r=>r.helperWaits),
      helperReplayApplies:sum(records,r=>r.helperReplayApplies),
      demandReservations:sum(records,r=>r.demandReservations),
      occurrencesPublished:sum(records,r=>r.occurrencesPublished),
      managerReplayApplies:sum(records,r=>r.managerReplayApplies),
      maxActiveWork:max(records,r=>r.maxActiveWork),
      maxRssBytes:max(records,r=>r.maxRssBytes),
      values:records.map(r=>[r.sequence,r.failed?'FAILED':r.value,r.failed?r.error:r.move]),
    });
  }
  const summary={
    kind:'surplus-helper-quantum-sweep',
    node:process.version,cpu:os.cpus()[0]?.model??null,
    rootControlQuantum:512,roots:roots.map(seq),results,
  };
  process.stdout.write(JSON.stringify(summary)+'\n');
  if(results.some(r=>r.failed))process.exitCode=1;
}
