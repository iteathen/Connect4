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

const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const parentSequence='444441566666232222423317771611';
const theoremSequence='4444415666662322224233177716111';

function fromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,c){
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,c,
    words,0,basis,0,seen,sizes,0
  );
  return {words,basis,n:sizes[0],terminal};
}
function support(q){return Array.from(q.words.slice(0,7));}
function exactEqual(a,b){
  if(a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}

const parent=fromSequence(parentSequence);
const theoremRoot=fromSequence(theoremSequence);
assert.equal(parent.words[g.metaOffset]>>>2,30);
assert.equal((parent.words[g.metaOffset]>>>2)&1,0);
assert.equal(parent.terminal,0);

const child=step(parent,0);
const exactChildMatch=child.terminal===0&&exactEqual(child,theoremRoot);

const phase=JSON.parse(execFileSync(
  process.execPath,
  [resolve('research/isograph/discovery/2026-09-30-universal-structural-policy/run-cpc-three-column-phase-transfer-win.mjs'),resolve(library)],
  {encoding:'utf8',maxBuffer:32*1024*1024}
));
assert.equal(phase.jsMinSysSha,EXPECTED);
assert.equal(phase.oracleUsed,false);
assert.equal(phase.solvedInputsUsed,false);

const accept=child.terminal===0&&exactChildMatch&&phase.accept===true;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank30_phase_transfer_composition.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:'CPC_RANK30_PHASE_TRANSFER_COMPOSITION_THEOREM.md',
  parent:{
    sequence:parentSequence,
    rank:30,
    mover:1,
    support:support(parent)
  },
  move:{
    player:1,
    column:1,
    terminal:child.terminal,
    childSupport:support(child),
    expectedSequence:theoremSequence,
    exactChildMatchesQualifiedRoot:exactChildMatch
  },
  premise:{
    theorem:'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_THEOREM.md',
    accept:phase.accept,
    root:phase.root
  },
  accept,
  conclusion:accept?[
    'The exact rank-30 state is a Player-1 win by column 1.',
    'P1:c1 reaches exactly the qualified rank-31 three-column phase-transfer theorem root.',
    'No solved or search-derived value is used as a proof premise.'
  ]:[
    'The frozen rank-30 composition failed exact state matching or premise qualification.'
  ],
  boundary:[
    'All state transitions and equality checks use exact RBA.',
    'No oracle, Pons, solved W/D/L input, local game-tree value, minimax, best-move table, physical identity, or sealed holdout is used.',
    'Production CPC and JSMinSys are read-only and unchanged.'
  ]
},null,2));
