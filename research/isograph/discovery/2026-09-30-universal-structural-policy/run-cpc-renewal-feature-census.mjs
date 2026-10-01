#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});

const moves=s=>Array.from(s,c=>Number(c)-1);
function qOf(s){return connect4RbaFromMoves(moves(s),{geometry:g,canonical:false});}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function cells(id){const out=[],n=g.shapeSize[id],base=id*4;for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);return out;}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)));
}
function earliest(q,id,player){
  const rank=q.words[g.metaOffset]>>>2,mover=rank&1,remaining=g.cellCount-rank,first=player===mover?1:2;
  const needs=cells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
  return slot-2;
}
function pairingsAll(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(let i=0;i<tail.length;i++){const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));for(const p of pairingsAll(rest))out.push([[a,b],...p]);}
  return out;
}
function optionalMatchings(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(const p of optionalMatchings(tail))out.push(p);
  for(let i=0;i<tail.length;i++){const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));for(const p of optionalMatchings(rest))out.push([[a,b],...p]);}
  return out;
}
function product(arrays,i=0,prefix=[],out=[]){
  if(i===arrays.length){out.push(prefix.slice());return out;}
  for(const v of arrays[i]){prefix.push(v);product(arrays,i+1,prefix,out);prefix.pop();}
  return out;
}
function templates(q){
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),odds=[],evens=[];
  for(let c=0;c<g.columns;c++){if(!rem[c])continue;(rem[c]&1?odds:evens).push(c);}
  if(odds.length&1)return [];
  const out=[];
  for(const opairs of pairingsAll(odds))for(const epairs of optionalMatchings(evens)){
    const pairs=[...opairs,...epairs],paired=new Set(pairs.flat());
    const choices=pairs.map(([a,b])=>{const parity=rem[a]&1,ls=[];for(let L=1;L<=Math.min(rem[a],rem[b]);L++)if((L&1)===parity)ls.push(L);return ls;});
    if(choices.some(x=>!x.length))continue;
    for(const lengths of product(choices)){
      const vertical=new Set(),cross=[];
      for(let i=0;i<pairs.length;i++){
        const [a,b]=pairs[i],L=lengths[i];
        for(let j=0;j<L;j++)cross.push([(q.words[a]+j)*g.columns+a,(q.words[b]+j)*g.columns+b]);
        for(const c of [a,b])for(let r=q.words[c]+L;r+1<g.rows;r+=2)vertical.add((r+1)*g.columns+c);
      }
      let valid=true;
      for(let c=0;c<g.columns;c++)if(!paired.has(c)){
        if(rem[c]&1){valid=false;break;}
        for(let r=q.words[c];r+1<g.rows;r+=2)vertical.add((r+1)*g.columns+c);
      }
      if(valid)out.push({pairs:pairs.map((p,i)=>({cols:p.map(c=>c+1),length:lengths[i]})),vertical,cross});
    }
  }
  return out;
}
function covers(id,T){
  const cs=cells(id);
  if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);
  return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}
function analyze(sequence,label,repairable){
  const q=qOf(sequence),rank=q.words[g.metaOffset]>>>2,attacker=rank&1;
  const minimal=activeMinimal(q,attacker);
  const residuals=minimal.map(id=>({id,size:g.shapeSize[id],deadline:earliest(q,id,attacker),cells:cells(id)})).filter(x=>x.deadline!==null);

  const hist={},deadlineHist={};
  for(const r of residuals){
    hist[r.size]=(hist[r.size]??0)+1;
    deadlineHist[r.deadline]=(deadlineHist[r.deadline]??0)+1;
  }
  const pairs=residuals.filter(r=>r.size===2).map(r=>({
    shape:r.id,
    deadline:r.deadline,
    cells:r.cells.map(cell=>({
      column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1,
      supportDistance:g.cellRow[cell]-q.words[g.cellColumn[cell]]
    }))
  }));

  const ts=templates(q);
  let baseH=-1,minDef5=Infinity,bestDef5=[],safe3Count=0,safe5Count=0;
  for(const T of ts){
    const uncovered=residuals.filter(r=>!covers(r.id,T));
    const first=uncovered.length?Math.min(...uncovered.map(r=>r.deadline)):Infinity;
    const h=Number.isFinite(first)?first-2:g.cellCount-rank;
    if(h>baseH)baseH=h;
    const critical3=residuals.filter(r=>r.deadline<=3);
    const critical5=residuals.filter(r=>r.deadline<=5);
    const d3=critical3.filter(r=>!covers(r.id,T)).length;
    const d5=critical5.filter(r=>!covers(r.id,T)).length;
    if(d3===0)safe3Count++;
    if(d5===0)safe5Count++;
    if(d5<minDef5){minDef5=d5;bestDef5=[{pairs:T.pairs,uncovered:critical5.filter(r=>!covers(r.id,T)).map(r=>r.id)}];}
    else if(d5===minDef5&&bestDef5.length<8)bestDef5.push({pairs:T.pairs,uncovered:critical5.filter(r=>!covers(r.id,T)).map(r=>r.id)});
  }

  const heights=Array.from({length:g.columns},(_,c)=>q.words[c]);
  const phase=heights.map(x=>x&1);
  const derivative=Array.from({length:g.columns-1},(_,i)=>phase[i]^phase[i+1]);
  return {
    label,sequence,repairable,rank,attacker:attacker+1,heights,phase,derivative,
    basisSize:q.basis.length,minimalResidualCount:residuals.length,
    minimalSizeHistogram:hist,deadlineHistogram:deadlineHist,pairResiduals:pairs,
    templateCount:ts.length,baseH,minDef5,safe3TemplateCount:safe3Count,safe5TemplateCount:safe5Count,
    sampleBestDef5Templates:bestDef5
  };
}

const states=[
  // Candidate 6: fixed H=3 but one-switch H=5.
  ['c6_14','444441566614',true],
  ['c6_41','444441566641',true],
  ['c6_56','444441566656',true],
  ['c6_65','444441566665',true],

  // Candidate 2: fixed H=3 and one-switch H=3.
  ['c2_12','444441566212',false],
  ['c2_21','444441566221',false],
  ['c2_33','444441566233',false],
  ['c2_45','444441566245',false],
  ['c2_54','444441566254',false],
  ['c2_66','444441566266',false],
  ['c2_77','444441566277',false],

  // Candidate 3 limiting branches; 22 is the one repairable control.
  ['c3_13','444441566313',false],
  ['c3_22','444441566322',true],
  ['c3_31','444441566331',false],
  ['c3_45','444441566345',false],
  ['c3_54','444441566354',false],
  ['c3_66','444441566366',false],
  ['c3_77','444441566377',false],
].map(([label,sequence,repairable])=>analyze(sequence,label,repairable));

assert(states.filter(x=>x.repairable).every(x=>x.baseH===3));
assert(states.filter(x=>!x.repairable).every(x=>x.baseH===3));

console.log(JSON.stringify({
  schema:'connect4.cpc_renewal_feature_census.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  labelAuthority:'repairable means fixed H=3 and independently certified one-switch H=5 from CPC two-switch evidence',
  states,
  boundary:[
    'This is theorem-discovery evidence only.',
    'No scalar feature is promoted to a proof rule merely because it separates this census.',
    'A candidate renewal predicate must still receive an independent geometric derivation and fresh control.'
  ]
},null,2));
