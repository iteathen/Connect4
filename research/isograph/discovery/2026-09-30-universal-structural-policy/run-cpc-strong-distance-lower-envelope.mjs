// CPC/RBA-basis strong-distance lower-envelope control.
// One aggregate residual-basis calculation per state; no oracle, no game-tree search.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-strong-distance-lower-envelope.mjs <JSMinSys checkout>');
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4CpcScratch,evaluateConnect4Cpc32}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});

function coordHas(words,base,index){
  return (words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeMinimalResiduals(q,player){
  const coord=player?g.p1Offset:g.p0Offset;
  const active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))
    active.push(q.basis[i]);
  const minimal=active.filter(id=>!active.some(other=>
    other!==id &&
    g.shapeSize[other]<g.shapeSize[id] &&
    connect4RbaShapeSubset(g,other,id)
  ));
  return {active,minimal};
}
function shapeCells(id){
  const n=g.shapeSize[id],base=id*4,out=[];
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out;
}
function earliestUnopposed(words,shapeId){
  const cells=shapeCells(shapeId);
  const needs=cells.map(cell=>{
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    return r-words[c]+1;
  }).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=1;
  const rank=words[g.metaOffset]>>>2,remaining=g.cellCount-rank;
  for(const need of needs){
    while(slot<need)slot+=2;
    if(slot>remaining)return null;
    slot+=2;
  }
  return slot-2;
}
function pairingsAll(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(let i=0;i<tail.length;i++){
    const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));
    for(const p of pairingsAll(rest))out.push([[a,b],...p]);
  }
  return out;
}
function optionalMatchings(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(const p of optionalMatchings(tail))out.push(p);
  for(let i=0;i<tail.length;i++){
    const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));
    for(const p of optionalMatchings(rest))out.push([[a,b],...p]);
  }
  return out;
}
function product(arrays,i=0,prefix=[],out=[]){
  if(i===arrays.length){out.push(prefix.slice());return out;}
  for(const v of arrays[i]){prefix.push(v);product(arrays,i+1,prefix,out);prefix.pop();}
  return out;
}
function templates(words){
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-words[c]);
  const odds=[],evens=[];
  for(let c=0;c<g.columns;c++){
    if(rem[c]===0)continue;
    (rem[c]&1?odds:evens).push(c);
  }
  if(odds.length&1)return [];
  const out=[];
  for(const opairs of pairingsAll(odds))for(const epairs of optionalMatchings(evens)){
    const pairs=[...opairs,...epairs],paired=new Set(pairs.flat());
    const choices=pairs.map(([a,b])=>{
      const parity=rem[a]&1,ls=[];
      for(let L=1;L<=Math.min(rem[a],rem[b]);L++)if((L&1)===parity)ls.push(L);
      return ls;
    });
    if(choices.some(x=>!x.length))continue;
    for(const lengths of product(choices)){
      const vertical=new Set(),cross=[];
      for(let i=0;i<pairs.length;i++){
        const [a,b]=pairs[i],L=lengths[i];
        for(let j=0;j<L;j++)cross.push([
          (words[a]+j)*g.columns+a,
          (words[b]+j)*g.columns+b
        ]);
        for(const c of [a,b])
          for(let r=words[c]+L;r+1<g.rows;r+=2)
            vertical.add((r+1)*g.columns+c);
      }
      let valid=true;
      for(let c=0;c<g.columns;c++)if(!paired.has(c)){
        if(rem[c]&1){valid=false;break;}
        for(let r=words[c];r+1<g.rows;r+=2)vertical.add((r+1)*g.columns+c);
      }
      if(valid)out.push({
        pairs:pairs.map((p,i)=>({cols:p.map(c=>c+1),length:lengths[i]})),
        vertical,cross
      });
    }
  }
  return out;
}
function covers(shapeId,T){
  const cells=shapeCells(shapeId);
  if(cells.some(cell=>T.vertical.has(cell)))return true;
  const set=new Set(cells);
  return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}
function lowerEnvelope(q,attacker){
  const residuals=activeMinimalResiduals(q,attacker);
  const rows=residuals.minimal
    .map(id=>({id,deadline:earliestUnopposed(q.words,id),cells:shapeCells(id)}))
    .filter(x=>x.deadline!==null)
    .sort((a,b)=>a.deadline-b.deadline||a.id-b.id);
  let best={horizon:-1,template:null,firstUncovered:[]};
  for(const T of templates(q.words)){
    const uncovered=rows.filter(r=>!covers(r.id,T));
    const first=uncovered.length?uncovered[0].deadline:Infinity;
    const rank=q.words[g.metaOffset]>>>2;
    const horizon=Number.isFinite(first)?first-2:g.cellCount-rank;
    if(horizon>best.horizon)best={horizon,template:T,firstUncovered:uncovered.slice(0,8)};
  }
  return {
    activeResidualCount:residuals.active.length,
    minimalResidualCount:residuals.minimal.length,
    horizon:best.horizon,
    templatePairs:best.template?.pairs??null,
    firstUncovered:best.firstUncovered.map(r=>({
      shapeId:r.id,
      deadline:r.deadline,
      cells:r.cells.map(cell=>({column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1}))
    }))
  };
}

const states=[
  {id:'candidate2',sequence:'4444415662',expected:3},
  {id:'candidate3',sequence:'4444415663',expected:3},
  {id:'candidate6',sequence:'4444415666',expected:5},
  {id:'candidate6_forced_2_then_3',sequence:'444441566623',expected:5},
  {id:'candidate6_forced_3_then_2',sequence:'444441566632',expected:5},
];
const rows=[];
for(const state of states){
  const q=connect4RbaFromMoves(Array.from(state.sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  const rank=q.words[g.metaOffset]>>>2,attacker=rank&1;
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const nativeKind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  const lower=lowerEnvelope(q,attacker);
  assert.equal(lower.horizon,state.expected,`${state.id} CPC-basis lower horizon mismatch`);
  rows.push({
    ...state,
    rank,
    attacker:attacker+1,
    basisSize:q.basis.length,
    nativeCpc:{
      kind:nativeKind,
      absoluteInterval:[scratch.interval[0]-2,scratch.interval[1]-2],
      forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
      preemptionMask32:scratch.preemptionMask32[0]>>>0
    },
    strongDistanceLowerFromCpcBasis:lower
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_strong_distance_lower_envelope.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  obligationSource:'minimal active generators of the native RBA/CPC residual coordinate',
  oneAggregateCalculationPerState:true,
  rows,
  conclusion:'The CPC/RBA obligation basis reproduces survival floors [3,3,5] for v4 candidates 2/3/6 and preserves 5 across both forced candidate-6 response successors. Individual external obligation scoring is unnecessary for this lower-bound primitive.',
  boundary:'This proves only the lower/survival component. Native CPC still emits no finite forced-completion upper rank at these states, so no interval separation or v5 license follows.'
},null,2));
