#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const DIR=resolve('research/isograph/discovery/2026-09-30-universal-structural-policy');
const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);

const ROOT='4444415666662322224233';
const C1=0;
const R24_C1=ROOT+'11';
const R24_C3=ROOT+'13';
const R24_C7=ROOT+'17';

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,g.columns));}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function exactEqual(a,b){
  if(a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function runJson(script,...args){
  return JSON.parse(execFileSync(
    process.execPath,[resolve(DIR,script),...args],
    {encoding:'utf8',maxBuffer:64*1024*1024}
  ));
}
function premiseCommonOk(p){
  return p.jsMinSysSha===EXPECTED&&p.oracleUsed===false&&p.solvedInputsUsed===false&&p.accept===true;
}

const q22=fromSequence(ROOT);
assert.equal(q22.terminal,0);
assert.equal(rankOf(q22),22);
assert.equal(moverOf(q22),0);
assert.deepEqual(support(q22),[1,6,3,6,1,5,0]);

const afterP1c1=step(q22,C1);
assert.equal(afterP1c1.terminal,0);
assert.equal(rankOf(afterP1c1),23);

const legalDefenderReplies=[];
const childByReply=new Map();
for(let d=0;d<g.columns;d++){
  if(afterP1c1.words[d]>=g.rows)continue;
  legalDefenderReplies.push(d+1);
  childByReply.set(d+1,step(afterP1c1,d));
}
assert.deepEqual(legalDefenderReplies,[1,3,5,6,7]);

const oldLocal=runJson('run-cpc-rank22-c1-zugzwang-composition.mjs',resolve(library));
assert.equal(oldLocal.schema,'connect4.cpc_rank22_c1_zugzwang_composition.v1');
assert.equal(oldLocal.jsMinSysSha,EXPECTED);
assert.equal(oldLocal.oracleUsed,false);
assert.equal(oldLocal.solvedInputsUsed,false);
assert.equal(oldLocal.parent.sequence,ROOT);
const oldRows=new Map(oldLocal.moveCertificate.rows.map(x=>[x.defenderReplyColumn,x]));

const routes=[];

async function unused(){}

const handoffs=[
  {
    defenderColumn:1,
    kind:'EXACT_RANK24_ZUGZWANG_HANDOFF',
    expectedSequence:R24_C1,
    runner:'run-cpc-rank24-zugzwang-win-composition.mjs',
    schema:'connect4.cpc_rank24_zugzwang_win_composition.v1'
  },
  {
    defenderColumn:3,
    kind:'EXACT_RANK24_SINGLETON_HANDOFF',
    expectedSequence:R24_C3,
    runner:'run-cpc-rank24-reply3-singleton-handoff-composition.mjs',
    schema:'connect4.cpc_rank24_reply3_singleton_handoff_composition.v1'
  },
  {
    defenderColumn:7,
    kind:'EXACT_RANK24_ROUTED_HANDOFF',
    expectedSequence:R24_C7,
    runner:'run-cpc-rank24-reply7-routed-win-composition.mjs',
    schema:'connect4.cpc_rank24_reply7_routed_win_composition.v1'
  }
];

for(const h of handoffs){
  const child=childByReply.get(h.defenderColumn);
  const expected=fromSequence(h.expectedSequence);
  const exactHandoff=
    !!child&&child.terminal===0&&rankOf(child)===24&&exactEqual(child,expected);
  const premise=runJson(h.runner,resolve(library));
  const premiseOk=
    premise.schema===h.schema&&
    premiseCommonOk(premise)&&
    (premise.ordinaryGameTreeSearchUsed===undefined||premise.ordinaryGameTreeSearchUsed===false);
  routes.push({
    defenderColumn:h.defenderColumn,
    kind:h.kind,
    replyTerminal:child?.terminal??null,
    replyRank:child?rankOf(child):null,
    replySupport:child?support(child):null,
    exactHandoff,
    expectedSequence:h.expectedSequence,
    premise:{
      schema:premise.schema,
      accept:premise.accept,
      oracleUsed:premise.oracleUsed,
      solvedInputsUsed:premise.solvedInputsUsed,
      ordinaryGameTreeSearchUsed:premise.ordinaryGameTreeSearchUsed??false
    },
    accept:exactHandoff&&premiseOk
  });
}

for(const [c,kind] of [[5,'LOCAL_SHORT_COMPRESSION_RCIC'],[6,'LOCAL_HEIGHT1_COMPRESSION_RCIC']]){
  const child=childByReply.get(c);
  const row=oldRows.get(c);
  const localBranchAccept=
    !!row&&
    row.replyTerminal===0&&
    row.accept===true&&
    row.compression?.accept===true;
  const compression=row?.compression??null;
  const branchAcceptFlags=(compression?.branches??[]).map(x=>x.accept);
  const everySubbranchAccepted=
    c===5
      ? localBranchAccept
      : (localBranchAccept&&branchAcceptFlags.length>0&&branchAcceptFlags.every(Boolean));
  routes.push({
    defenderColumn:c,
    kind,
    replyTerminal:child?.terminal??null,
    replyRank:child?rankOf(child):null,
    replySupport:child?support(child):null,
    localBranchAccept,
    compressionMode:compression?.mode??null,
    compressionSubbranchCount:compression?.branches?.length??null,
    everyCompressionSubbranchAccepted:everySubbranchAccepted,
    accept:localBranchAccept&&everySubbranchAccepted
  });
}

routes.sort((a,b)=>a.defenderColumn-b.defenderColumn);
const accept=
  routes.length===legalDefenderReplies.length&&
  routes.every(x=>x.accept===true);

let rejectionReason=null;
if(!accept){
  const bad=routes.find(x=>x.accept!==true);
  rejectionReason=bad?('route-c'+bad.defenderColumn+'-failed'):'routing-partition-incomplete';
}

console.log(JSON.stringify({
  schema:'connect4.cpc_rank22_c1_routed_win_composition.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  theoremCandidate:'CPC_RANK22_C1_ROUTED_WIN_COMPOSITION_THEOREM.md',
  proofSchema:'RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md',
  rank22:{
    sequence:ROOT,
    rank:rankOf(q22),
    mover:moverOf(q22)+1,
    support:support(q22)
  },
  p1Column:1,
  afterP1:{
    terminal:afterP1c1.terminal,
    rank:rankOf(afterP1c1),
    support:support(afterP1c1)
  },
  legalDefenderReplies,
  routes,
  accept,
  rejectionReason,
  conclusion:accept?[
    'The exact rank-22 state is structurally certified as a Player-1 win by column 1.',
    'The proof is proof routing: replies c1, c3, and c7 hand off exactly to three independently qualified rank-24 theorem roots, while replies c5 and c6 reuse freshly re-executed compression-to-target-reservoir RCIC branches.',
    'The two branches that made the older uniform compression theorem fail are therefore resolved by theorem-root normalization rather than a new local mechanism.',
    'No new game-specific proof primitive is introduced by this rank-22 closure.'
  ]:[
    'At least one frozen proof route failed; the rank-22 routed composition is rejected at the recorded seam.'
  ],
  boundary:[
    'No diagnostic W/D/L, Pons/oracle value, solved database, ordinary game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity, or sealed holdout is used.',
    'Exact RBA equality is required for all theorem-root handoffs; support equality alone is not accepted.',
    'The c5/c6 compression-reservoir branches are freshly re-executed from current-state structural machinery even though the older overall rank-22 theorem remains false.',
    'No new game-specific proof primitive is introduced; this theorem composes existing CIC/RCIC classes and progress edges.',
    'Production CPC, JSMinSys, and BSFP remain unchanged.'
  ]
},null,2));
