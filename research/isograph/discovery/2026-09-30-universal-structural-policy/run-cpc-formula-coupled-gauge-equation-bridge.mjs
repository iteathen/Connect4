#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED_JS='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const EXPECTED_FORMULA='f6bfce75ebf6aeafef08b9102ce20e0bfade2bdb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED_JS);
assert.equal(git('status','--porcelain'),'');

const load=n=>import(pathToFileURL(resolve(library,'addons',n+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {connect4CpcTargetOwner32}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3;
const C3=2,C5=4,C7=6;
const T3=4*7+2; // c3r5
const T5=3*7+4; // c5r4
const rootSequence='4444415666662322224233177716111';

function fromSequence(sequence){
  const x=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,c){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(q.words[c]<6);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,c,
    words,0,basis,0,seen,sizes,0
  );
  return {words,basis,n:sizes[0],terminal};
}
function exactEqual(a,b){
  if(a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function support(q){return Array.from(q.words.slice(0,7));}
function coordHas(q,p,index){
  const base=p?g.p1Offset:g.p0Offset;
  return !!(q.words[base+(index>>>5)]&(1<<(index&31)));
}
function activeIds(q,p){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,p,i))out.push(q.basis[i]);
  return out;
}
function minimalIds(q,p){
  const a=activeIds(q,p);
  return a.filter(id=>!a.some(o=>
    o!==id&&g.shapeSize[o]<g.shapeSize[id]&&connect4RbaShapeSubset(g,o,id)
  ));
}
function cellsOf(id){
  const n=g.shapeSize[id],base=id*4,out=[];
  for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);
  return out;
}
function residualGroups(q,p){
  return minimalIds(q,p).map(id=>({id,cells:cellsOf(id)}));
}
function hasSingleton(q,p,cell){
  return residualGroups(q,p).some(r=>r.cells.length===1&&r.cells[0]===cell);
}
function permutations(n){
  const out=[],a=[...Array(n).keys()];
  function rec(i){
    if(i===n){out.push([...a]);return;}
    for(let j=i;j<n;j++){
      [a[i],a[j]]=[a[j],a[i]];
      rec(i+1);
      [a[i],a[j]]=[a[j],a[i]];
    }
  }
  rec(0);
  return out;
}
const pmemo=new Map();
function perms(n){
  if(!pmemo.has(n))pmemo.set(n,permutations(n));
  return pmemo.get(n);
}
function componentize(q){
  const groups=[residualGroups(q,P1),residualGroups(q,P2)];
  const parent=[...Array(7).keys()];
  function find(x){
    while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}
    return x;
  }
  function union(a,b){a=find(a);b=find(b);if(a!==b)parent[b]=a;}
  for(const ownerGroups of groups)for(const r of ownerGroups){
    const cols=[...new Set(r.cells.map(cell=>g.cellColumn[cell]))].sort((a,b)=>a-b);
    for(let i=1;i<cols.length;i++)union(cols[0],cols[i]);
  }
  const byRoot=new Map();
  for(let c=0;c<7;c++){
    const r=find(c);
    if(!byRoot.has(r))byRoot.set(r,[]);
    byRoot.get(r).push(c);
  }
  const comps=[];
  for(const cols of byRoot.values()){
    const loc=new Map(cols.map((c,i)=>[c,i]));
    let best=null;
    for(const p of perms(cols.length)){
      const caps=Array(cols.length);
      for(let li=0;li<cols.length;li++)caps[p[li]]=(6-q.words[cols[li]])&1;
      const ownerGroups=[];
      const depthHists=[new Map(),new Map()];
      for(let owner=0;owner<2;owner++){
        const encoded=[];
        for(const r of groups[owner]){
          const rcols=[...new Set(r.cells.map(cell=>g.cellColumn[cell]))];
          if(!rcols.every(c=>loc.has(c)))continue;
          const terms=[];
          for(const cell of r.cells){
            const c=g.cellColumn[cell],row=g.cellRow[cell],d=row-q.words[c],role=p[loc.get(c)];
            assert(d>=0);
            terms.push(d+':'+role);
            depthHists[owner].set(d,(depthHists[owner].get(d)??0)+1);
          }
          terms.sort();
          encoded.push(terms.join(','));
        }
        encoded.sort();
        ownerGroups.push(encoded);
      }
      function histString(h){
        return [...h].sort((a,b)=>a[0]-b[0]).map(([d,n])=>d+':'+n).join(',');
      }
      const selected='w'+cols.length+'|cap='+caps.join('.')+
        '|dh0='+histString(depthHists[0])+'|dh1='+histString(depthHists[1]);
      const attachment='r0='+ownerGroups[0].join(';')+'|r1='+ownerGroups[1].join(';');
      const augmented=selected+'|'+attachment;
      if(best===null||augmented<best.augmented){
        best={selected,attachment,augmented,caps,perm:[...p],ownerGroups,
          depthHist:[histString(depthHists[0]),histString(depthHists[1])]};
      }
    }
    comps.push({cols:cols.map(c=>c+1),width:cols.length,...best});
  }
  comps.sort((a,b)=>a.augmented.localeCompare(b.augmented));
  return comps;
}
function zoeTokens(comps,field,prefix){
  const counts=new Map();
  for(const c of comps)counts.set(c[field],(counts.get(c[field])??0)+1);
  const tokens=[];
  for(const [k,n] of [...counts].sort((a,b)=>a[0].localeCompare(b[0]))){
    tokens.push(prefix+':P:'+k);
    if(n&1)tokens.push(prefix+':O:'+k);
  }
  return {counts:Object.fromEntries(counts),tokens};
}
function componentForColumn(comps,column1){
  return comps.find(c=>c.cols.includes(column1));
}
function liveRoleVector(q,comps,column){
  const m=new Map();
  const comp=componentForColumn(comps,column+1);
  m.set('W',comp?.width??1);
  m.set('C',(6-q.words[column])&1);
  for(let owner=0;owner<2;owner++)for(const r of residualGroups(q,owner))for(const cell of r.cells){
    if(g.cellColumn[cell]!==column)continue;
    const d=g.cellRow[cell]-q.words[column];
    const k='D'+owner+':'+d;
    m.set(k,(m.get(k)??0)+1);
  }
  return m;
}
function deltaMap(a,b){
  const keys=[...new Set([...a.keys(),...b.keys()])].sort();
  const out=new Map();
  for(const k of keys){
    const d=(b.get(k)??0)-(a.get(k)??0);
    if(d!==0)out.set(k,d);
  }
  return out;
}
function addScaled(dst,src,scale){
  for(const [k,v] of src)dst.set(k,(dst.get(k)??0)+scale*v);
}
function cleanMap(m){
  for(const [k,v] of [...m])if(v===0)m.delete(k);
  return m;
}
function deltaString(m){
  return [...m].sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>k+'='+v).join(',')||'0';
}
function stateFeatures(q){
  const comps=componentize(q);
  const selected=zoeTokens(comps,'selected','S');
  const augmented=zoeTokens(comps,'augmented','A');
  const v3=liveRoleVector(q,comps,C3),v5=liveRoleVector(q,comps,C5),v7=liveRoleVector(q,comps,C7);
  const d35=deltaMap(v3,v5),d37=deltaMap(v3,v7),d57=deltaMap(v5,v7);
  const circuit=new Map();
  addScaled(circuit,d35,1);addScaled(circuit,d57,1);addScaled(circuit,d37,-1);cleanMap(circuit);
  const anchors=[
    'G:OWNER3:'+String(connect4CpcTargetOwner32(g,q.words,0,T3)+1),
    'G:OWNER5:'+String(connect4CpcTargetOwner32(g,q.words,0,T5)+1),
    'G:SINGLE3:'+String(hasSingleton(q,P1,T3)?1:0),
    'G:SINGLE5:'+String(hasSingleton(q,P1,T5)?1:0),
  ];
  const deltaTokens=[
    'D:35:'+deltaString(d35),
    'D:37:'+deltaString(d37),
    'D:57:'+deltaString(d57),
  ];
  return {
    comps,selected,augmented,
    roleVectors:{c3:Object.fromEntries(v3),c5:Object.fromEntries(v5),c7:Object.fromEntries(v7)},
    deltas:{d35:deltaString(d35),d37:deltaString(d37),d57:deltaString(d57)},
    circuitResidual:deltaString(circuit),
    anchors,deltaTokens,
  };
}
function rowTokens(featureFamily,stateF,trigger){
  const t='T:'+trigger;
  if(featureFamily==='SELECTED')return [...stateF.selected.tokens,t];
  if(featureFamily==='AUGMENTED')return [...stateF.augmented.tokens,t];
  if(featureFamily==='DELTA')return [...stateF.deltaTokens,t];
  if(featureFamily==='DELTA_ANCHORED')return [...stateF.deltaTokens,...stateF.anchors,t];
  throw new Error('unknown family');
}
function monomials(tokens,degree){
  const z=[...new Set(tokens)].sort();
  const out=['1'];
  for(const a of z)out.push('1:'+a);
  if(degree>=2)for(let i=0;i<z.length;i++)for(let j=i+1;j<z.length;j++)out.push('2:'+z[i]+'&'+z[j]);
  if(degree>=3)for(let i=0;i<z.length;i++)for(let j=i+1;j<z.length;j++)for(let k=j+1;k<z.length;k++)
    out.push('3:'+z[i]+'&'+z[j]+'&'+z[k]);
  return out;
}
function fit(rows,family,degree){
  const monoRows=rows.map(r=>monomials(rowTokens(family,r.features,r.trigger),degree));
  const vocab=[...new Set(monoRows.flat())].sort();
  const index=new Map(vocab.map((k,i)=>[k,i]));
  const pivots=new Map();
  let contradictions=0,firstContradiction=null;
  for(let ri=0;ri<rows.length;ri++){
    let row=monoRows[ri].map(k=>index.get(k)).sort((a,b)=>a-b);
    let rhs=rows[ri].code;
    while(row.length){
      const p=row[row.length-1],prior=pivots.get(p);
      if(!prior){pivots.set(p,{row,rhs,source:ri});break;}
      const a=row,b=prior.row,o=[];let i=0,j=0;
      while(i<a.length||j<b.length){
        if(i>=a.length){o.push(...b.slice(j));break;}
        if(j>=b.length){o.push(...a.slice(i));break;}
        if(a[i]===b[j]){i++;j++;continue;}
        if(a[i]<b[j])o.push(a[i++]);else o.push(b[j++]);
      }
      row=o;rhs^=prior.rhs;
    }
    if(row.length===0&&rhs!==0){
      contradictions++;
      if(firstContradiction===null)firstContradiction={
        rowIndex:ri,state:rows[ri].state,trigger:rows[ri].trigger,
        responseClass:rows[ri].responseClass,reducedRhs:rhs
      };
    }
  }
  return {degree,variables:vocab.length,pivotRank:pivots.size,nullity:vocab.length-pivots.size,contradictions,firstContradiction};
}
function collisionAudit(rows,family){
  const m=new Map();
  for(const r of rows){
    const k=rowTokens(family,r.features,r.trigger).sort().join('||');
    if(!m.has(k))m.set(k,{codes:new Set(),rows:[]});
    m.get(k).codes.add(r.code);m.get(k).rows.push({state:r.state,trigger:r.trigger,responseClass:r.responseClass});
  }
  const conflicts=[];
  for(const [key,v] of m)if(v.codes.size>1)conflicts.push({key,codes:[...v.codes],rows:v.rows});
  return {classes:m.size,conflictingClasses:conflicts.length,conflicts};
}

const Q=fromSequence(rootSequence);
assert.equal(Q.words[g.metaOffset]>>>2,31);
assert.equal(((Q.words[g.metaOffset]>>>2)&1),P2);

const q5=step(Q,C5);assert.equal(q5.terminal,0);
const A=step(q5,C7);assert.equal(A.terminal,0);
const q7=step(Q,C7);assert.equal(q7.terminal,0);
const B=step(q7,C7);assert.equal(B.terminal,0);
const a7=step(A,C7);assert.equal(a7.terminal,0);
const ZA=step(a7,C7);assert.equal(ZA.terminal,0);
const b5=step(B,C5);assert.equal(b5.terminal,0);
const ZB=step(b5,C7);assert.equal(ZB.terminal,0);
const b7=step(B,C7);assert.equal(b7.terminal,0);
const ZC=step(b7,C5);assert.equal(ZC.terminal,0);
assert(exactEqual(ZA,ZB)&&exactEqual(ZA,ZC));
const Z=ZA;

const states={Q,A,B,Z};
const f={};
for(const [name,q] of Object.entries(states))f[name]=stateFeatures(q);

const CODE={TC3:1,TC5:2,X5:4,X7:8};
const rows=[];
function terminalRow(stateName,q,trigger,response,responseClass){
  const d=step(q,trigger);assert.equal(d.terminal,0);
  const a=step(d,response);assert.equal(a.terminal,P1_WIN);
  rows.push({state:stateName,trigger:trigger+1,response:response+1,responseClass,code:CODE[responseClass],features:f[stateName]});
}
function transferRow(stateName,q,trigger,response,responseClass,expected){
  const d=step(q,trigger);assert.equal(d.terminal,0);
  const a=step(d,response);assert.equal(a.terminal,0);
  assert(exactEqual(a,expected));
  rows.push({state:stateName,trigger:trigger+1,response:response+1,responseClass,code:CODE[responseClass],features:f[stateName]});
}
terminalRow('Q',Q,C3,C3,'TC3');
transferRow('Q',Q,C5,C7,'X7',A);
transferRow('Q',Q,C7,C7,'X7',B);
terminalRow('A',A,C3,C3,'TC3');
terminalRow('A',A,C5,C5,'TC5');
transferRow('A',A,C7,C7,'X7',Z);
terminalRow('B',B,C3,C3,'TC3');
transferRow('B',B,C5,C7,'X7',Z);
transferRow('B',B,C7,C5,'X5',Z);
terminalRow('Z',Z,C3,C3,'TC3');
terminalRow('Z',Z,C5,C5,'TC5');

const families=['SELECTED','AUGMENTED','DELTA','DELTA_ANCHORED'];
const systems={};
const collisions={};
for(const family of families){
  collisions[family]=collisionAudit(rows,family);
  systems[family]=[1,2,3].map(d=>fit(rows,family,d));
}

console.log(JSON.stringify({
  schema:'connect4.cpc_formula_coupled_gauge_equation_bridge.v1',
  jsMinSysSha:EXPECTED_JS,
  formulaFrameworkSha:EXPECTED_FORMULA,
  oracleUsed:false,
  solvedInputsUsed:false,
  formulaOutcomesUsed:false,
  sealedHoldoutsAccessed:false,
  hypothesis:'CPC_FORMULA_COUPLED_GAUGE_EQUATION_BRIDGE_HYPOTHESIS.md',
  theoremSource:'CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_THEOREM.md',
  states:Object.fromEntries(Object.entries(states).map(([name,q])=>[name,{
    rank:q.words[g.metaOffset]>>>2,
    mover:((q.words[g.metaOffset]>>>2)&1)+1,
    support:support(q),
    components:f[name].comps,
    selectedCounts:f[name].selected.counts,
    augmentedCounts:f[name].augmented.counts,
    roleVectors:f[name].roleVectors,
    pairDeltas:f[name].deltas,
    circuitResidual:f[name].circuitResidual,
    gaugeAnchors:f[name].anchors
  }])),
  responseRows:rows.map(r=>({state:r.state,trigger:r.trigger,response:r.response,responseClass:r.responseClass,code:r.code})),
  collisions,
  systems,
  structuralChecks:{
    allPairDeltaCircuitsClose:Object.values(f).every(x=>x.circuitResidual==='0'),
    sinkOrientationsExactRbaEqual:exactEqual(ZA,ZB)&&exactEqual(ZA,ZC)&&exactEqual(ZB,ZC),
  },
  conclusion:[
    'This experiment couples the late-IsoMax exchange/gauge framework to an independently qualified finite CPC response policy without importing either side\'s solved values.',
    'SELECTED tests width + role-capacity parity + owner-depth-histogram information; AUGMENTED adds exact residual grouping/role attachment from RBA.',
    'DELTA tests the three-reservoir exact pair-exchange triangle; DELTA_ANCHORED adds CPC target-owner/singleton gauge anchors.',
    'GF(2) affine/quadratic/cubic response-system contradictions quantify how much algebraic complexity each structural carrier needs.',
    'A selected-coordinate conflict removed by AUGMENTED is direct current-state evidence that residual grouping/role attachment is the missing variable named by the late-IsoMax revalidation checkpoint.'
  ],
  boundary:[
    'No formula W/D/L scalar code, formula holdout, Pons value, local game-tree value, minimax, opening book, or solved database is used.',
    'The response labels are exact terminal/transfer edges from the independently qualified CPC phase-transfer theorem, not outcome-fitted targets.',
    'Production CPC, JSMinSys, BSFP, and the formula branch are read-only and unchanged.'
  ]
},null,2));
