#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-gray-token-fresh-structural.mjs <JSMinSys checkout>');
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
function boardFrom(sequence){
  const heights=new Uint8Array(7),owner=new Int8Array(42);owner.fill(-1);
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1,r=heights[c]++;
    assert(c>=0&&c<7&&r<6,'invalid sequence '+sequence);
    owner[r*7+c]=i&1;
  }
  return {heights,owner};
}
function isWin(owner,cell,player){
  for(let line=0;line<g.lineCount;line++){
    const base=line*4;
    let contains=false,all=true;
    for(let i=0;i<4;i++){
      const x=g.lineRow[base+i]*7+g.lineColumn[base+i];
      if(x===cell)contains=true;
      if(owner[x]!==player)all=false;
    }
    if(contains&&all)return true;
  }
  return false;
}
function grayInfo(board){
  const relevant=new Uint8Array(42),gray=new Uint8Array(42);
  for(let line=0;line<g.lineCount;line++){
    const base=line*4;
    let p0Live=true,p1Live=true;
    for(let i=0;i<4;i++){
      const cell=g.lineRow[base+i]*7+g.lineColumn[base+i];
      const o=board.owner[cell];
      if(o===1)p0Live=false;
      else if(o===0)p1Live=false;
    }
    if(p0Live||p1Live)for(let i=0;i<4;i++){
      const cell=g.lineRow[base+i]*7+g.lineColumn[base+i];
      relevant[cell]=1;
    }
  }
  let count=0,oddMask=0;
  for(let c=0;c<7;c++)for(let r=0;r<board.heights[c];r++){
    const cell=r*7+c;
    if(!relevant[cell]){
      gray[cell]=1;count++;
      if((r&1)===0)oddMask|=1<<(c*3+(r>>>1));
    }
  }
  return {relevant,gray,count,oddMask:oddMask>>>0};
}
function defenderOddMask(board,attacker){
  const defender=1-attacker;let mask=0;
  for(let c=0;c<7;c++)for(let r=0;r<board.heights[c];r+=2)
    if(board.owner[r*7+c]===defender)mask|=1<<(c*3+(r>>>1));
  return mask>>>0;
}
function guards(board,attacker,gray){
  const safe=(defenderOddMask(board,attacker)|gray.oddMask)>>>0,out=[];
  for(let c=0;c<7;c++){
    const h=board.heights[c];
    if(!(h>=1&&h<=5&&(h&1)))continue;
    let ok=true;
    for(let r=0;r<h;r+=2)if(!(safe&(1<<(c*3+(r>>>1)))){ok=false;break;}
    if(ok)out.push(c);
  }
  return {safeMask:safe,columns:out};
}
function assertGrayDefinition(board,gray){
  for(let cell=0;cell<42;cell++)if(gray.gray[cell]){
    assert(board.owner[cell]>=0,'gray cell must be occupied');
    for(let line=0;line<g.lineCount;line++){
      const base=line*4,cells=[];
      let contains=false,has0=false,has1=false;
      for(let i=0;i<4;i++){
        const x=g.lineRow[base+i]*7+g.lineColumn[base+i];
        cells.push(x);if(x===cell)contains=true;
        if(board.owner[x]===0)has0=true;
        if(board.owner[x]===1)has1=true;
      }
      if(contains)assert(has0&&has1,'gray cell occurs on a live line');
    }
  }
}
function assertGrayMonotone(parentGray,childGray){
  for(let cell=0;cell<42;cell++)if(parentGray.gray[cell])
    assert(childGray.gray[cell],'gray cell revived at '+cell);
}

function generatedRoots(){
  const out=[],seen=new Set();
  for(let seed=1;seed<=512&&out.length<48;seed++){
    let x=(seed*2654435761)>>>0,sequence='',board=boardFrom('');
    for(let ply=0;ply<28;ply++){
      const order=[];
      for(let k=0;k<7;k++){x=(Math.imul(x,1664525)+1013904223)>>>0;order.push(x%7);}
      for(let c=0;c<7;c++)if(!order.includes(c))order.push(c);
      let played=false;
      for(const c of order){
        const r=board.heights[c];if(r>=6)continue;
        const player=ply&1,cell=r*7+c;
        board.owner[cell]=player;board.heights[c]=r+1;
        if(isWin(board.owner,cell,player)){
          board.heights[c]=r;board.owner[cell]=-1;continue;
        }
        sequence+=String(c+1);played=true;break;
      }
      if(!played)break;
      if(sequence.length>=10&&(sequence.length&1)===0){
        const gray=grayInfo(board);
        if(gray.count&& !seen.has(sequence)){
          seen.add(sequence);out.push(sequence);
          if(out.length>=48)break;
        }
      }
    }
  }
  return out;
}

const corpus=[
  '44556621','55667732','66771143','77112254','11223365','22334476','33445517',
  ...generatedRoots()
];

const roots=[];let transitions=0,grayRoots=0,grayCellsSeen=0,grayTransitions=0;
let terminalTriggers=0,terminalResponses=0;
for(const sequence of corpus){
  let q;
  try{q=ingress(sequence);}catch{continue;}
  if(terminal(q)!==0)continue;
  const board=boardFrom(sequence),attacker=mover(q),gray=grayInfo(board),gd=guards(board,attacker,gray);
  assert.equal(rank(q),sequence.length);
  assert.deepEqual(Array.from(q.words.slice(0,7)),Array.from(board.heights));
  assertGrayDefinition(board,gray);
  if(gray.count){grayRoots++;grayCellsSeen+=gray.count;}

  let local=0,localGray=0;
  for(const a of legal(q)){
    const first=cofactor(q,a),s1=sequence+String(a+1);
    if(first.term){terminalTriggers++;continue;}
    const direct1=ingress(s1),b1=boardFrom(s1),g1=grayInfo(b1);
    assert(qEqual(first.q,direct1),'attacker cofactor mismatch '+s1);
    assertGrayDefinition(b1,g1);assertGrayMonotone(gray,g1);
    for(const r of legal(first.q)){
      const second=cofactor(first.q,r),s2=s1+String(r+1);
      if(second.term){terminalResponses++;continue;}
      const direct2=ingress(s2),b2=boardFrom(s2),g2=grayInfo(b2);
      assert(qEqual(second.q,direct2),'defender cofactor mismatch '+s2);
      assertGrayDefinition(b2,g2);assertGrayMonotone(gray,g2);
      const childGuards=guards(b2,attacker,g2);
      assert(Number.isInteger(childGuards.safeMask));
      transitions++;local++;
      if(g2.count){grayTransitions++;localGray++;}
    }
  }
  roots.push({
    sequence,rank:sequence.length,support:Array.from(q.words.slice(0,7)),
    grayCells:gray.count,grayOddMask:gray.oddMask,
    defenderOddMask:defenderOddMask(board,attacker),
    effectiveOddSafeMask:gd.safeMask,
    effectiveGuards:gd.columns.map(x=>x+1),
    checkedTwoPlyTransitions:local,
    grayChildTransitions:localGray
  });
}

assert(grayRoots>=20,'insufficient gray roots');
assert(transitions>=500,'insufficient fresh transitions');
assert(grayTransitions>=200,'insufficient gray child transitions');

console.log(JSON.stringify({
  schema:'connect4.cpc_gray_token_fresh_structural.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  consumedBoundaryUsed:false,
  roots:roots.length,grayRoots,grayCellsSeen,twoPlyTransitions:transitions,
  grayChildTransitions:grayTransitions,terminalTriggers,terminalResponses,
  ranksCovered:[...new Set(roots.map(x=>x.rank))].sort((a,b)=>a-b),
  guardsObserved:[...new Set(roots.flatMap(x=>x.effectiveGuards))].sort((a,b)=>a-b),
  samples:roots,
  work:{cofactorCount},
  conclusion:[
    'Every directly classified gray token lay only on four-lines already containing both colors.',
    'Grayness of every already-occupied gray token was monotone across all checked exact nonterminal descendants.',
    'Defender-owned odd cells and gray odd cells compose into a current-state effective blocker-safe mask without changing support/gravity.'
  ],
  boundary:[
    'This qualifies gray detection, irreversibility, and effective odd-row resource reconstruction; it does not by itself qualify gray-key memo collisions.',
    'No oracle, solved value, strong distance, consumed c6 prefix, or best-move label is used.',
    'The exact RBA cofactor remains authoritative for response legality and terminal precedence.'
  ]
},null,2));
