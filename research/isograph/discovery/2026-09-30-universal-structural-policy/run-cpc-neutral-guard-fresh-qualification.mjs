#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-neutral-guard-fresh-qualification.mjs <JSMinSys checkout>');
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
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function qEqual(a,b){
  return a.words.length===b.words.length&&a.basis.length===b.basis.length&&
    a.words.every((x,i)=>x===b.words[i])&&a.basis.every((x,i)=>x===b.basis[i]);
}
function qWordsKey(q){
  return Buffer.from(q.words.buffer,q.words.byteOffset,q.words.byteLength).toString('base64');
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

const lineCells=[];
for(let line=0;line<g.lineCount;line++){
  const cells=[];
  for(let i=0;i<4;i++)cells.push(g.lineRow[line*4+i]*g.columns+g.lineColumn[line*4+i]);
  lineCells.push(cells);
}
const oddSlots=(g.rows+1)>>1;
function oddBit(c,row0){assert((row0&1)===0);return 1<<(c*oddSlots+(row0>>>1));}

function physical(sequence,attacker){
  const heights=new Uint8Array(g.columns),owner=new Int8Array(g.cellCount);owner.fill(-1);
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1,row=heights[c]++;
    assert(row<g.rows,'overflow '+sequence);
    owner[row*g.columns+c]=i&1;
  }
  const defender=1-attacker;
  let defenderOddMask=0;
  for(let c=0;c<g.columns;c++)for(let row=0;row<heights[c];row+=2){
    const cell=row*g.columns+c;
    if(owner[cell]===defender)defenderOddMask|=oddBit(c,row);
  }

  const relevant=new Uint8Array(g.cellCount);
  for(const cells of lineCells){
    let live0=true,live1=true;
    for(const cell of cells){
      const o=owner[cell];
      if(o===1)live0=false;
      else if(o===0)live1=false;
    }
    if(live0||live1)for(const cell of cells)relevant[cell]=1;
  }

  let neutralOddMask=0,neutralCount=0;
  const neutral=new Uint8Array(g.cellCount);
  for(let cell=0;cell<g.cellCount;cell++)if(owner[cell]>=0&&!relevant[cell]){
    neutral[cell]=1;neutralCount++;
    const c=g.cellColumn[cell],row=g.cellRow[cell];
    if((row&1)===0)neutralOddMask|=oddBit(c,row);
  }
  const effectiveMask=(defenderOddMask|neutralOddMask)>>>0;

  function guards(mask){
    const out=[];
    for(let c=0;c<g.columns;c++){
      const h=heights[c];
      if(!(h>=1&&h<=5&&(h&1)))continue;
      let ok=true;
      for(let row=0;row<h;row+=2)if((mask&oddBit(c,row))===0){ok=false;break;}
      if(ok)out.push(c);
    }
    return out;
  }
  return {
    heights,owner,relevant,neutral,neutralCount,
    defenderOddMask:defenderOddMask>>>0,
    neutralOddMask:neutralOddMask>>>0,
    effectiveMask,
    rawGuards:guards(defenderOddMask>>>0),
    effectiveGuards:guards(effectiveMask)
  };
}

let seed=0x6a09e667;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
function freshRoot(targetRank){
  for(let attempt=0;attempt<2000;attempt++){
    let q=ingress(''),sequence='';
    let ok=true;
    for(let ply=0;ply<targetRank;ply++){
      const ls=legal(q);
      if(!ls.length){ok=false;break;}
      const start=random()%ls.length;
      let chosen=null,next=null;
      for(let k=0;k<ls.length;k++){
        const c=ls[(start+k)%ls.length],tr=cofactor(q,c);
        if(!tr.term){chosen=c;next=tr.q;break;}
      }
      if(chosen===null){ok=false;break;}
      sequence+=String(chosen+1);q=next;
    }
    if(ok&&rank(q)===targetRank&&terminal(q)===0)return {sequence,q};
  }
  throw new Error('failed fresh root rank '+targetRank);
}

const roots=[];
for(const r of [6,8,10,12,14,16])for(let i=0;i<30;i++)roots.push(freshRoot(r));

let transitions=0,monotonicityViolations=0,newNeutral=0,newNeutralAttackerOdd=0;
let grayEnabledStates=0,grayEnabledGuards=0,grayRenewals=0;
let terminalTriggers=0,terminalResponses=0;
const quotientGroups=new Map(),qEffectiveMasks=new Map();
const examples=[];

function recordState(sequence,q,attacker,p){
  const qk=qWordsKey(q),k=qk+'|E'+p.effectiveMask;
  let group=quotientGroups.get(k);
  if(!group){group=new Set();quotientGroups.set(k,group);}
  group.add(p.defenderOddMask>>>0);
  let es=qEffectiveMasks.get(qk);
  if(!es){es=new Set();qEffectiveMasks.set(qk,es);}
  es.add(p.effectiveMask>>>0);
  const enabled=p.effectiveGuards.filter(c=>!p.rawGuards.includes(c));
  if(enabled.length){
    grayEnabledStates++;grayEnabledGuards+=enabled.length;
    if(examples.length<12)examples.push({
      sequence,rank:sequence.length,
      support:Array.from(p.heights),
      rawMask:p.defenderOddMask,neutralOddMask:p.neutralOddMask,effectiveMask:p.effectiveMask,
      rawGuards:p.rawGuards.map(x=>x+1),effectiveGuards:p.effectiveGuards.map(x=>x+1),
      grayEnabled:enabled.map(x=>x+1)
    });
  }
  return enabled;
}

for(const root of roots){
  const q=root.q,attacker=mover(q),p=physical(root.sequence,attacker);
  assert.deepEqual(Array.from(q.words.slice(0,g.columns)),Array.from(p.heights),'root support mismatch');
  const enabledRoot=recordState(root.sequence,q,attacker,p);

  for(const c of enabledRoot){
    if(q.words[c]>=5)continue;
    const first=cofactor(q,c);
    if(first.term)continue;
    const second=cofactor(first.q,c);
    if(second.term)continue;
    const s2=root.sequence+String(c+1)+String(c+1);
    assert(qEqual(second.q,ingress(s2)),'gray guard renewal cofactor mismatch '+s2);
    const p2=physical(s2,attacker);
    assert(p2.effectiveGuards.includes(c),'gray-enabled guard failed renewal '+s2);
    grayRenewals++;
  }

  for(const a of legal(q)){
    const first=cofactor(q,a);
    const s1=root.sequence+String(a+1);
    if(first.term){terminalTriggers++;continue;}
    assert(qEqual(first.q,ingress(s1)),'attacker cofactor mismatch '+s1);
    for(const rcol of legal(first.q)){
      const second=cofactor(first.q,rcol);
      const s2=s1+String(rcol+1);
      if(second.term){terminalResponses++;continue;}
      assert(qEqual(second.q,ingress(s2)),'defender cofactor mismatch '+s2);
      const child=physical(s2,attacker);
      recordState(s2,second.q,attacker,child);

      for(let cell=0;cell<g.cellCount;cell++)if(p.neutral[cell]){
        if(!child.neutral[cell])monotonicityViolations++;
      }
      for(let cell=0;cell<g.cellCount;cell++){
        if(p.owner[cell]<0)continue;
        if(!p.neutral[cell]&&child.neutral[cell]){
          newNeutral++;
          const row=g.cellRow[cell];
          if((row&1)===0&&p.owner[cell]===attacker)newNeutralAttackerOdd++;
        }
      }
      transitions++;
    }
  }
}

let quotientRawMaskCollisions=0,maxRawMasksPerQuotient=0;
for(const set of quotientGroups.values()){
  if(set.size>1)quotientRawMaskCollisions++;
  if(set.size>maxRawMasksPerQuotient)maxRawMasksPerQuotient=set.size;
}
let qWithMultipleEffectiveMasks=0,maxEffectiveMasksPerQ=0;
for(const set of qEffectiveMasks.values()){
  if(set.size>1)qWithMultipleEffectiveMasks++;
  if(set.size>maxEffectiveMasksPerQ)maxEffectiveMasksPerQ=set.size;
}

assert.equal(monotonicityViolations,0,'neutrality must be monotone');
assert(roots.length>=100,'insufficient roots');
assert(transitions>=5000,'insufficient two-ply transitions');
assert(newNeutralAttackerOdd>0,'need attacker-owned odd cells that newly become neutral');
assert(grayEnabledGuards>0,'need guards enabled by neutral odd cells');
assert(grayRenewals>0,'need direct gray-enabled guard renewals');

console.log(JSON.stringify({
  schema:'connect4.cpc_neutral_guard_fresh_structural.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  consumedBoundaryUsed:false,
  roots:roots.length,
  ranksCovered:[...new Set(roots.map(x=>x.sequence.length))].sort((a,b)=>a-b),
  twoPlyTransitions:transitions,
  terminalTriggers,terminalResponses,
  neutral:{
    monotonicityViolations,newNeutral,newNeutralAttackerOdd,
    grayEnabledStates,grayEnabledGuards,grayRenewals
  },
  quotient:{
    groups:quotientGroups.size,
    quotientRawMaskCollisions,
    maxRawMasksPerQuotient,
    qClasses:qEffectiveMasks.size,
    qWithMultipleEffectiveMasks,
    maxEffectiveMasksPerQ
  },
  examples,
  work:{cofactorCount},
  conclusion:[
    'Direct 7x6 live-line reconstruction found no reversal of neutral status for an already occupied neutral cell.',
    'Fresh transitions include attacker-owned odd cells that later become neutral and are therefore safely promoted into the neutral-aware odd-row safety mask.',
    'Fresh states contain guards enabled only by neutral odd cells, and tested same-column renewals preserve those guards exactly.',
    'The effective mask removes raw odd-row ownership distinctions only after direct live-line irrelevance is established.'
  ],
  boundary:[
    'This qualifies neutral detection, monotonicity, neutral-aware guard reconstruction, and sampled renewal behavior; it does not by itself qualify unrestricted memo collision reuse at new horizons.',
    'Exact RBA cofactors remain authoritative and matched direct ingress replay for every checked nonterminal transition.',
    'No oracle, solved value, best move, consumed candidate-6 boundary, or strong-distance label is used.'
  ]
},null,2));
