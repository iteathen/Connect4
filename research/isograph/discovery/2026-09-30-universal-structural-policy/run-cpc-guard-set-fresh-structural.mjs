#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-guard-set-fresh-structural.mjs <JSMinSys checkout>');
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const moves=s=>Array.from(s,c=>Number(c)-1);

function ingress(sequence){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis};
}
const rank=q=>q.words[g.metaOffset]>>>2;
const terminal=q=>q.words[g.metaOffset]&3;
const mover=q=>rank(q)&1;
function legal(q){const out=[];for(let c=0;c<7;c++)if(q.words[c]<6)out.push(c);return out;}
function qEqual(a,b){
  return a.words.length===b.words.length&&a.basis.length===b.basis.length&&
    a.words.every((x,i)=>x===b.words[i])&&a.basis.every((x,i)=>x===b.basis[i]);
}
let cofactorCount=0;
function cofactor(q,column){
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,column,q.words[column],
    words,0,basisBuf,0,seen,sizes,0
  );
  cofactorCount++;
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}
function oddBit(c,row0){return 1<<(c*3+(row0>>>1));}
function physical(sequence,attacker){
  const h=new Uint8Array(7),owner=new Int8Array(42);owner.fill(-1);
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1,row=h[c]++;
    assert(row<6,'overflow '+sequence);
    owner[row*7+c]=i&1;
  }
  const defender=1-attacker;
  let mask=0;
  for(let c=0;c<7;c++)for(let row=0;row<h[c];row+=2)
    if(owner[row*7+c]===defender)mask|=oddBit(c,row);
  const guards=[];
  for(let c=0;c<7;c++){
    const height=h[c];
    if(!(height>=1&&height<=5&&(height&1)))continue;
    let ok=true;
    for(let row=0;row<height;row+=2)if(owner[row*7+c]!==defender){ok=false;break;}
    if(ok)guards.push(c);
  }
  return {heights:h,owner,mask:mask>>>0,guards};
}
function maskMove(mask,c,row0,defenderMove){
  if(row0&1)return mask>>>0;
  const bit=oddBit(c,row0);
  return defenderMove?((mask|bit)>>>0):((mask&~bit)>>>0);
}
function maskAfterPair(q,mask,a,r){
  const ar=q.words[a];
  let x=maskMove(mask,a,ar,false);
  const rr=r===a?ar+1:q.words[r];
  x=maskMove(x,r,rr,true);
  return x>>>0;
}
function guardsFrom(q,mask){
  const out=[];
  for(let c=0;c<7;c++){
    const h=q.words[c];
    if(!(h>=1&&h<=5&&(h&1)))continue;
    let ok=true;
    for(let row=0;row<h;row+=2)if((mask&oddBit(c,row))===0){ok=false;break;}
    if(ok)out.push(c);
  }
  return out;
}

const corpus=[
  '41','52','63','14','25','36','47',
  '2231','3342','4453','5564','6675','7716','1127',
  '44556621','55667732','66771143','77112254','11223365','22334476','33445517'
];

const roots=[];let transitions=0,terminalTriggers=0,terminalResponses=0;
for(const sequence of corpus){
  const q=ingress(sequence);
  if(terminal(q)!==0)continue;
  const attacker=mover(q);
  const p=physical(sequence,attacker);
  assert.equal(rank(q),sequence.length,'rank/sequence');
  assert.deepEqual(Array.from(q.words.slice(0,7)),Array.from(p.heights),'support mismatch '+sequence);
  assert.deepEqual(guardsFrom(q,p.mask),p.guards,'root guard mismatch '+sequence);

  let local=0;
  for(const a of legal(q)){
    const first=cofactor(q,a);
    const s1=sequence+String(a+1);
    if(first.term){terminalTriggers++;continue;}
    assert(qEqual(first.q,ingress(s1)),'attacker cofactor mismatch '+s1);
    for(const r of legal(first.q)){
      const second=cofactor(first.q,r);
      const s2=s1+String(r+1);
      if(second.term){terminalResponses++;continue;}
      assert(qEqual(second.q,ingress(s2)),'defender cofactor mismatch '+s2);
      const predicted=maskAfterPair(q,p.mask,a,r);
      const direct=physical(s2,attacker);
      assert.equal(predicted,direct.mask,'mask mismatch '+s2);
      assert.deepEqual(guardsFrom(second.q,predicted),direct.guards,'guard-set mismatch '+s2);
      transitions++;local++;
    }
  }
  roots.push({
    sequence,rank:sequence.length,
    support:Array.from(q.words.slice(0,7)),
    oddDefenderMask:p.mask,
    guards:p.guards.map(x=>x+1),
    checkedTwoPlyTransitions:local
  });
}

assert(roots.length>=20,'insufficient fresh roots');
assert(transitions>=500,'insufficient fresh transitions');

console.log(JSON.stringify({
  schema:'connect4.cpc_guard_set_fresh_structural.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  consumedBoundaryUsed:false,
  roots:roots.length,
  twoPlyTransitions:transitions,
  terminalTriggers,
  terminalResponses,
  ranksCovered:[...new Set(roots.map(x=>x.rank))].sort((a,b)=>a-b),
  guardsObserved:[...new Set(roots.flatMap(x=>x.guards))].sort((a,b)=>a-b),
  samples:roots,
  work:{cofactorCount},
  conclusion:[
    'The compact defender odd-row ownership mask is exactly updated by every tested nonterminal two-ply cofactor transition.',
    'The active guard set derived from the compact mask exactly equals direct reconstruction from colored occupancy after every tested transition.',
    'The representation therefore preserves simultaneous guard acquisition, preservation, loss, and re-establishment on the fresh structural corpus.'
  ],
  boundary:[
    'This qualifies the current-state guard-set representation/update law, not any particular response-selection policy.',
    'No oracle, solved value, strong distance, consumed c6 prefix, or best-move label is used.',
    'Survival theorems using the descriptor retain their separate response-rule and universal-branch proof burdens.'
  ]
},null,2));
