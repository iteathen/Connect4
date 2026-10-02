import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q5d34-three-safe-action-consequence-closure.mjs');
const library=process.argv[2];
assert(library);

const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q5d34_three_safe_action_consequence_closure.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceQ,'5d34e24395b9d801');
assert.equal(r.sequence,'4444415666662322224255115153113777');
assert.equal(r.rank,34);
assert.deepEqual(r.support,[6,6,3,6,5,5,3]);
assert.deepEqual(r.safeP0Actions,[5,6,7]);
assert.equal(r.children.length,3);
assert.deepEqual(r.children.map(x=>x.p0Action),[5,6,7]);

const allowed=new Set(['P0_WIN_FORCED_CHAIN','P0_LOSS_FORCED_CHAIN','DRAW_FULL_BOARD','UNRESOLVED_MULTIPLE_SAFE']);
for(const child of r.children){
  assert.equal(child.startRank,35);
  assert.equal(child.startSequence,r.sequence+String(child.p0Action));
  assert.ok(/^[0-9a-f]{16}$/.test(child.startQ));
  assert.ok(allowed.has(child.classification));
  assert.ok(Array.isArray(child.steps)&&child.steps.length>=1);
  assert.equal(child.steps[0].mover,'P1');
  for(const step of child.steps){
    assert.ok(Array.isArray(step.safeActions));
    assert.ok(Array.isArray(step.actionAudit));
    assert.equal(step.safeActions.length===1,step.forcedAction!==null);
  }
  if(child.classification==='UNRESOLVED_MULTIPLE_SAFE'){
    assert.ok(child.steps.at(-1).safeActions.length>1);
    assert.ok(/^[0-9a-f]{16}$/.test(child.unresolvedFork.exactQClass));
  }
}

const rootAllowed=new Set(['P0_WIN_EXISTS_SAFE_ACTION','P0_NONWIN_ALL_SAFE_ACTIONS','UNKNOWN']);
assert.ok(rootAllowed.has(r.classification));
if(r.classification==='P0_WIN_EXISTS_SAFE_ACTION')assert.ok(r.children.some(x=>x.classification==='P0_WIN_FORCED_CHAIN'));
if(r.classification==='P0_NONWIN_ALL_SAFE_ACTIONS')assert.ok(r.children.every(x=>x.classification==='P0_LOSS_FORCED_CHAIN'||x.classification==='DRAW_FULL_BOARD'));
if(r.classification==='UNKNOWN')assert.ok(r.children.some(x=>x.classification==='UNRESOLVED_MULTIPLE_SAFE'));

assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.legacyRepairModified,false);
assert.equal(r.rcicModified,false);
assert.equal(r.bsfpModified,false);
const efMerge=r.exactQMergeGroups.find(x=>x.exactQClass==='e5d63da12420fdb3');
assert.ok(efMerge);
assert.equal(efMerge.memberCount,2);
assert.equal(efMerge.distinctRootActionCount,2);
assert.equal(efMerge.crossRootActionMerge,true);
assert.deepEqual([...new Set(efMerge.members.map(x=>x.p0Action))].sort((a,b)=>a-b),[5,6]);
assert.ok(r.boundary.some(x=>x.includes('No solved W/D/L')));

console.log(JSON.stringify({
  pass:true,
  classification:r.classification,
  children:r.children.map(x=>({action:x.p0Action,q:x.startQ,classification:x.classification,forcedLength:x.forcedSequence.length})),
  mergeCount:r.exactQMergeGroups.filter(x=>x.memberCount>1).length
}));
