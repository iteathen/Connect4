import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-rlc-ranked-controlled-invariant-instantiation-audit.mjs');
const raw=execFileSync(process.execPath,[runner],{encoding:'utf8',maxBuffer:16*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.rlc_ranked_controlled_invariant_instantiation_audit.v1');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.mechanisms.guardSet.classification,'CIC');
assert.equal(r.mechanisms.guardSet.responseTotal,true);
assert.equal(r.mechanisms.guardSet.currentStateResourceReconstructible,true);
assert.equal(r.mechanisms.guardSet.progressRank,null);
assert.equal(r.mechanisms.guardSet.winClaim,false);

assert.equal(r.mechanisms.forcedCompression.classification,'PROGRESS_EDGE');
assert.equal(r.mechanisms.forcedCompression.sourceAccept,true);
assert.deepEqual(r.mechanisms.forcedCompression.progressMeasure,{kind:'live-residual-cardinality',before:2,after:1});
assert.equal(r.mechanisms.forcedCompression.allBranchesCloseOrDecrease,true);
assert.equal(r.mechanisms.forcedCompression.standaloneWinClaim,false);

assert.equal(r.mechanisms.targetReservoir.classification,'RCIC');
assert.equal(r.mechanisms.targetReservoir.sourceAccept,true);
assert.equal(r.mechanisms.targetReservoir.responseTotal,true);
assert.equal(r.mechanisms.targetReservoir.obligationCoverageComplete,true);
assert.equal(r.mechanisms.targetReservoir.wellFoundedProgress,true);
assert.equal(r.mechanisms.targetReservoir.winClaim,true);

assert.equal(r.mechanisms.bxPhase.classification,'RCIC');
assert.equal(r.mechanisms.bxPhase.sourceAccept,true);
assert.equal(r.mechanisms.bxPhase.allStatesViable,true);
assert.equal(r.mechanisms.bxPhase.allExposureEdgesTerminal,true);
assert.equal(r.mechanisms.bxPhase.allTransferEdgesPreserveViability,true);
assert.equal(r.mechanisms.bxPhase.allTransferEdgesDecreaseRank,true);
assert.equal(r.mechanisms.bxPhase.rootProvedByInduction,true);

assert.equal(r.mechanisms.phaseStateMachine.classification,'RCIC_REALIZATION');
assert.equal(r.mechanisms.phaseStateMachine.sourceAccept,true);
assert.equal(r.mechanisms.phaseStateMachine.exactSinkEquality,true);

assert.equal(r.merger.guardSetIsSafetySuperclass,true);
assert.equal(r.merger.compressionIsProgressGenerator,true);
assert.equal(r.merger.reservoirAndPhaseShareRcicSchema,true);
assert.equal(r.merger.newTopLevelPrimitiveRequired,false);
assert.ok(r.boundary.some(x=>x.includes('no new Connect Four state')));

console.log(JSON.stringify({
  pass:true,
  classifications:Object.fromEntries(Object.entries(r.mechanisms).map(([k,v])=>[k,v.classification])),
  merger:r.merger
}));
