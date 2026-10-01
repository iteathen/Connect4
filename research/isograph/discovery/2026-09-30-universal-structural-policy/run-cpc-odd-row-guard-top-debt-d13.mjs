#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
const maxD=Number(process.argv[3]??15);
assert(library);
assert(Number.isInteger(maxD)&&maxD>=3&&(maxD&1),'max horizon must be odd >=3');
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32
}=await load('cpc-connect4');
const CPC_KIND=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);

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
function keyOf(q){return Array.from(q.words).join(',')+'|'+Array.from(q.basis).join(',');}
function cpcSummary(q){
  const scratch=prepareConnect4CpcScratch(g,{frontierResponse:true,projectedAdvisory:false});
  const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.basis.length,scratch);
  return {
    kind:CPC_KIND.get(kind),
    interval:[scratch.interval[0]-2,scratch.interval[1]-2],
    forcedColumn:scratch.forcedColumn[0]>=0?scratch.forcedColumn[0]+1:null,
    preemptionCount:scratch.preemptionCount[0],
    preemptionMask32:scratch.preemptionMask32[0]>>>0,
    precursorCount:scratch.precursorCount[0],
  };
}
function coordHas(words,base,index){return (words[base+(index>>>5)]&(1<<(index&31)))!==0;}
function activeMinimal(q,player){
  const coord=player?g.p1Offset:g.p0Offset,active=[];
  for(let i=0;i<q.basis.length;i++)if(coordHas(q.words,coord,i))active.push(q.basis[i]);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeCells(id){const out=[],n=g.shapeSize[id],base=id*4;for(let i=0;i<n;i++)out.push(g.shapeCells[base+i]);return out;}
function earliest(q,id,player){
  const r=rank(q),first=player===mover(q)?1:2,remaining=g.cellCount-r;
  const needs=shapeCells(id).map(cell=>g.cellRow[cell]-q.words[g.cellColumn[cell]]+1).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){while(slot<need)slot+=2;if(slot>remaining)return null;slot+=2;}
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

const templateMemo=new Map();
function templates(q){
  const qk=keyOf(q);
  const prior=templateMemo.get(qk);if(prior)return prior;
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),odds=[],evens=[];
  for(let c=0;c<g.columns;c++){if(!rem[c])continue;(rem[c]&1?odds:evens).push(c);}
  if(odds.length&1){templateMemo.set(qk,[]);return [];}
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
      const vertical=new Set(),cross=[],response=new Map(),pairDesc=[];
      for(let i=0;i<pairs.length;i++){
        const [a,b]=pairs[i],L=lengths[i];pairDesc.push({cols:[a+1,b+1],length:L});
        for(let j=0;j<L;j++){
          const ca=(q.words[a]+j)*g.columns+a,cb=(q.words[b]+j)*g.columns+b;
          cross.push([ca,cb]);response.set(ca,cb);response.set(cb,ca);
        }
        for(const c of [a,b])for(let r=q.words[c]+L;r+1<g.rows;r+=2){
          const lo=r*g.columns+c,hi=(r+1)*g.columns+c;vertical.add(hi);response.set(lo,hi);
        }
      }
      let valid=true;
      for(let c=0;c<g.columns;c++)if(!paired.has(c)){
        if(rem[c]&1){valid=false;break;}
        for(let r=q.words[c];r+1<g.rows;r+=2){
          const lo=r*g.columns+c,hi=(r+1)*g.columns+c;vertical.add(hi);response.set(lo,hi);
        }
      }
      if(valid)out.push({pairs:pairDesc,vertical,cross,response});
    }
  }
  templateMemo.set(qk,out);return out;
}
function covers(id,T){
  const cs=shapeCells(id);if(cs.some(c=>T.vertical.has(c)))return true;
  const set=new Set(cs);return T.cross.some(([a,b])=>set.has(a)&&set.has(b));
}

function pooledFrontierNoWin(q,attacker){
  assert.equal(terminal(q),0);
  assert.equal(mover(q),attacker);
  const responseCells=new Set();
  let poolCount=0;
  for(let c=0;c<g.columns;c++){
    const h=q.words[c],remaining=g.rows-h;
    if(!remaining)continue;
    let start=h;
    if(remaining&1){poolCount+=1;start+=1;}
    for(let r=start;r+1<g.rows;r+=2)responseCells.add((r+1)*g.columns+c);
  }
  if(poolCount&1)return {accept:false,poolCount,uncovered:null};
  const residuals=activeMinimal(q,attacker);
  const uncovered=residuals.filter(id=>!shapeCells(id).some(cell=>responseCells.has(cell)));
  return {
    accept:uncovered.length===0,
    poolCount,
    activeResiduals:residuals.length,
    responseCells:[...responseCells],
    uncovered
  };
}

const baseMemo=new Map();
function baseSafe(q,attacker,D){
  const mk=keyOf(q)+'|A'+attacker+'|B'+D;
  if(baseMemo.has(mk))return baseMemo.get(mk);
  assert.equal(terminal(q),0);assert.equal(mover(q),attacker);
  const critical=activeMinimal(q,attacker)
    .map(id=>({id,deadline:earliest(q,id,attacker)}))
    .filter(x=>x.deadline!==null&&x.deadline<=D);
  if(!critical.length){const r={safe:true,pairs:[],critical:0};baseMemo.set(mk,r);return r;}
  for(const T of templates(q)){
    if(critical.every(r=>covers(r.id,T))){
      const r={safe:true,pairs:T.pairs,critical:critical.length};baseMemo.set(mk,r);return r;
    }
  }
  const r={safe:false,pairs:null,critical:critical.length};baseMemo.set(mk,r);return r;
}

let cofactorCount=0;
const cofactorMemo=new Map();
function cofactor(q,column){
  const qk=keyOf(q),mk=qk+'|C'+column;
  if(cofactorMemo.has(mk))return cofactorMemo.get(mk);
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,column,q.words[column],
    words,0,basisBuf,0,seen,sizes,0
  );
  cofactorCount++;
  const out={term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
  cofactorMemo.set(mk,out);return out;
}
function responseSuccessor(q,T,attacker,column){
  const frontier=q.words[column]*g.columns+column,mate=T.response.get(frontier);
  if(mate===undefined)return {ok:false,reason:'NO_RESPONSE'};
  const first=cofactor(q,column);
  if(first.term){
    const attackerTerminal=attacker===0?3:1;
    if(first.term===attackerTerminal)return {ok:false,reason:'ATTACKER_TERMINAL'};
    return {ok:true,closed:true,reason:'NON_ATTACKER_TERMINAL'};
  }
  const rc=g.cellColumn[mate],rr=g.cellRow[mate];
  if(first.q.words[rc]!==rr)return {ok:false,reason:'ILLEGAL_RESPONSE'};
  const second=cofactor(first.q,rc);
  if(second.term)return {ok:true,closed:true,responseColumn:rc+1,reason:'DEFENDER_OR_DRAW_TERMINAL'};
  assert.equal(mover(second.q),attacker);
  return {ok:true,closed:false,q:second.q,responseColumn:rc+1};
}

const responseOptionMemo=new Map();
function adaptiveResponseOptions(q,attacker,column){
  const mk=keyOf(q)+'|A'+attacker+'|R'+column;
  if(responseOptionMemo.has(mk))return responseOptionMemo.get(mk);
  const frontier=q.words[column]*g.columns+column,byMate=new Map();

  // Existing complete synchronized-response templates remain authoritative.
  for(const T of templates(q)){
    const mate=T.response.get(frontier);
    if(mate!==undefined&&!byMate.has(mate))
      byMate.set(mate,{mate,template:T,source:'SYNCHRONIZED_TEMPLATE',residualId:null});
  }

  // Attachment-preserving frontier residual edge:
  // if the observed trigger and another currently playable cell lie in the
  // same active minimal attacker residual, the defender may answer at that
  // other frontier cell. The exact cofactor child still has to satisfy the
  // downstream survival class; this local edge alone makes no value claim.
  for(const id of activeMinimal(q,attacker)){
    const cells=shapeCells(id);
    if(!cells.includes(frontier))continue;
    for(const mate of cells){
      if(mate===frontier)continue;
      const rc=g.cellColumn[mate],rr=g.cellRow[mate];
      if(rc===column||q.words[rc]!==rr)continue;
      if(byMate.has(mate))continue;
      byMate.set(mate,{
        mate,
        source:'FRONTIER_RESIDUAL_EDGE',
        residualId:id,
        template:{
          response:new Map([[frontier,mate]]),
          pairs:[{
            frontierResidual:id,
            trigger:{column:column+1,row:g.cellRow[frontier]+1},
            response:{column:rc+1,row:rr+1}
          }]
        }
      });
    }
  }

  // Cross-residual +2-row ladder transport:
  // trigger z belongs to a 3-cell residual whose two surviving cells are
  // exactly two rows above a currently playable 2-cell residual. A defender
  // response at either lower cell kills the lower residual while the exact
  // cofactor transports the triggered residual to the upper pair. The
  // downstream proof class remains authoritative for all other consequences.
  const residualIds=activeMinimal(q,attacker);
  for(const midId of residualIds){
    const mid=shapeCells(midId);
    if(!mid.includes(frontier)||mid.length!==3)continue;
    const upper=mid.filter(cell=>cell!==frontier);
    if(upper.length!==2)continue;
    const upperCols=upper.map(cell=>g.cellColumn[cell]);
    if(upperCols[0]===upperCols[1]||upperCols.includes(column))continue;
    for(const lowId of residualIds){
      if(lowId===midId)continue;
      const low=shapeCells(lowId);
      if(low.length!==2)continue;
      let matches=true;
      const orderedLow=[];
      for(const up of upper){
        const uc=g.cellColumn[up],ur=g.cellRow[up];
        const want=low.find(cell=>g.cellColumn[cell]===uc&&g.cellRow[cell]===ur-2);
        if(want===undefined){matches=false;break;}
        orderedLow.push(want);
      }
      if(!matches||new Set(orderedLow).size!==2)continue;
      if(!orderedLow.every(cell=>q.words[g.cellColumn[cell]]===g.cellRow[cell]))continue;
      for(const mate of orderedLow){
        if(byMate.has(mate))continue;
        const rc=g.cellColumn[mate],rr=g.cellRow[mate];
        byMate.set(mate,{
          mate,
          source:'CROSS_RESIDUAL_LADDER_EDGE',
          residualId:midId,
          lowerResidualId:lowId,
          template:{
            response:new Map([[frontier,mate]]),
            pairs:[{
              ladder:true,
              lowerResidual:lowId,
              middleResidual:midId,
              trigger:{column:column+1,row:g.cellRow[frontier]+1},
              response:{column:rc+1,row:rr+1},
              transportedPair:upper.map(cell=>({column:g.cellColumn[cell]+1,row:g.cellRow[cell]+1}))
            }]
          }
        });
      }
    }
  }

  const out=[...byMate.values()];
  responseOptionMemo.set(mk,out);return out;
}

const classMemo=new Map();
let classCalls=0,responseOptionsTested=0,branchTests=0,memoHits=0;
function classS(q,attacker,D){
  assert(D>=3&&(D&1));
  const qk=keyOf(q),mk=qk+'|A'+attacker+'|SAD'+D;
  if(classMemo.has(mk)){memoHits++;return classMemo.get(mk);}
  classCalls++;
  const pooled=pooledFrontierNoWin(q,attacker);
  if(pooled.accept){
    const r={accept:true,class:'POOLED_FRONTIER_NOWIN',pooled};
    classMemo.set(mk,r);return r;
  }
  const base=baseSafe(q,attacker,D);
  if(base.safe){
    const r={accept:true,class:'B'+D,witness:base.pairs};
    classMemo.set(mk,r);return r;
  }
  if(D===3){
    const r={accept:false,class:'OUTSIDE_SAD3'};
    classMemo.set(mk,r);return r;
  }

  const branchWitnesses=[];
  for(const c of legal(q)){
    branchTests++;
    let found=null;
    for(const option of adaptiveResponseOptions(q,attacker,c)){
      responseOptionsTested++;
      const tr=responseSuccessor(q,option.template,attacker,c);
      if(!tr.ok)continue;
      if(tr.closed){
        found={
          attackerColumn:c+1,responseColumn:tr.responseColumn,closed:true,
          templatePairs:option.template.pairs,responseSource:option.source,childClass:'CLOSED'
        };
        break;
      }
      const child=classS(tr.q,attacker,D-2);
      if(child.accept){
        found={
          attackerColumn:c+1,responseColumn:tr.responseColumn,closed:false,
          templatePairs:option.template.pairs,responseSource:option.source,childClass:child.class
        };
        break;
      }
    }
    if(!found){
      const r={accept:false,class:'OUTSIDE_SAD'+D,failedTrigger:c+1};
      classMemo.set(mk,r);return r;
    }
    branchWitnesses.push(found);
  }

  const r={
    accept:true,class:'AD_R'+(D-2)+'_TO_S'+D,
    witnessByTrigger:branchWitnesses
  };
  classMemo.set(mk,r);return r;
}


const guardMemo=new Map();
let guardCalls=0,guardMemoHits=0,guardBranchTests=0,guardResponses=0,topDebtTests=0,topDebtClosures=0;
function terminalPolarity(code,attacker){
  if(code===0)return 'NONTERMINAL';
  if(code===2)return 'DRAW';
  return code===(attacker===0?3:1)?'ATTACKER':'DEFENDER';
}
function surviveOne(q,attacker){
  assert.equal(terminal(q),0);assert.equal(mover(q),attacker);
  for(const c of legal(q)){
    const first=cofactor(q,c);
    if(terminalPolarity(first.term,attacker)==='ATTACKER')return false;
  }
  return true;
}
function classG(q,attacker,D,guardCol){
  assert(D>=1&&(D&1));
  assert.equal(terminal(q),0);assert.equal(mover(q),attacker);
  const h=q.words[guardCol];
  assert(h===1||h===3||h===5,'guard height must be odd row 1/3/5');
  const mk=keyOf(q)+'|A'+attacker+'|G'+guardCol+'|D'+D;
  if(guardMemo.has(mk)){guardMemoHits++;return guardMemo.get(mk);}
  guardCalls++;

  if(D===1){
    const accept=surviveOne(q,attacker);
    const r={accept,class:accept?'GUARD_ONE':'GUARD_ONE_FAIL'};
    guardMemo.set(mk,r);return r;
  }

  const ordinary=classS(q,attacker,D);
  if(ordinary.accept){
    const r={accept:true,class:'GUARD_DROP_TO_'+ordinary.class,ordinaryClass:ordinary.class};
    guardMemo.set(mk,r);return r;
  }

  const witnesses=[];
  for(const c of legal(q)){
    guardBranchTests++;
    const first=cofactor(q,c),p1=terminalPolarity(first.term,attacker);
    if(p1==='ATTACKER'){
      const r={accept:false,class:'GUARD_ATTACKER_TERMINAL',failedTrigger:c+1};
      guardMemo.set(mk,r);return r;
    }
    if(p1==='DRAW'||p1==='DEFENDER'){
      witnesses.push({attackerColumn:c+1,closed:p1,mode:'TRIGGER_CLOSED'});
      continue;
    }

    let found=null;

    // Exact guard renewal. At odd guard height 1 or 3, an attacker move in the
    // guard column lands on the next even row; defender immediately occupies
    // the following odd row, restoring the guard at height +2.
    if(c===guardCol&&h<5){
      const second=cofactor(first.q,guardCol),p2=terminalPolarity(second.term,attacker);
      guardResponses++;
      if(p2==='DRAW'||p2==='DEFENDER'){
        found={attackerColumn:c+1,responseColumn:guardCol+1,mode:'GUARD_RENEW',closed:p2};
      }else if(p2==='NONTERMINAL'){
        const child=classG(second.q,attacker,D-2,guardCol);
        if(child.accept)found={
          attackerColumn:c+1,responseColumn:guardCol+1,mode:'GUARD_RENEW',
          childClass:child.class,guardHeightBefore:h,guardHeightAfter:second.q.words[guardCol]
        };
      }
    }

    // Support-lift blocker edge. The attacker trigger releases exactly one
    // same-column cell above it. Admit that one response only when the released
    // cell belongs to a live attacker residual in the exact post-trigger state.
    if(!found && first.q.words[c]<g.rows){
      const released=first.q.words[c]*g.columns+c;
      const attached=activeMinimal(first.q,attacker).some(id=>shapeCells(id).includes(released));
      if(attached){
        const second=cofactor(first.q,c),p2=terminalPolarity(second.term,attacker);
        guardResponses++;
        if(p2==='DRAW'||p2==='DEFENDER'){
          found={
            attackerColumn:c+1,responseColumn:c+1,mode:'SUPPORT_LIFT_BLOCKER',
            releasedCell:{column:c+1,row:g.cellRow[released]+1},closed:p2
          };
        }else if(p2==='NONTERMINAL'){
          const preserve=c!==guardCol;
          const child=preserve
            ? classG(second.q,attacker,D-2,guardCol)
            : (D-2===1
                ? {accept:surviveOne(second.q,attacker),class:'ORDINARY_ONE'}
                : classS(second.q,attacker,D-2));
          if(child.accept)found={
            attackerColumn:c+1,responseColumn:c+1,mode:'SUPPORT_LIFT_BLOCKER',
            releasedCell:{column:c+1,row:g.cellRow[released]+1},
            childClass:child.class,guardPreserved:preserve
          };
        }
      }
    }

    // Top-exhaustion phase-debt repair. If the attacker just filled a
    // non-guard column, the missing same-column response may be transported to
    // a guard-preserving frontier resource that is attached to at least one
    // live attacker residual. The exact transported child must re-enter the
    // same guard class.
    if(!found && c!==guardCol && first.q.words[c]===g.rows){
      const postResiduals=activeMinimal(first.q,attacker);
      for(const rcol of legal(first.q)){
        if(rcol===guardCol || rcol===c)continue;
        const responseCell=first.q.words[rcol]*g.columns+rcol;
        const attached=postResiduals.some(id=>shapeCells(id).includes(responseCell));
        if(!attached)continue;
        topDebtTests++;guardResponses++;
        const second=cofactor(first.q,rcol),p2=terminalPolarity(second.term,attacker);
        if(p2==='DRAW'||p2==='DEFENDER'){
          topDebtClosures++;
          found={
            attackerColumn:c+1,responseColumn:rcol+1,mode:'TOP_DEBT_ATTACHED_REPAIR',
            responseCell:{column:rcol+1,row:g.cellRow[responseCell]+1},closed:p2
          };
          break;
        }
        if(p2!=='NONTERMINAL')continue;
        const child=classG(second.q,attacker,D-2,guardCol);
        if(child.accept){
          topDebtClosures++;
          found={
            attackerColumn:c+1,responseColumn:rcol+1,mode:'TOP_DEBT_ATTACHED_REPAIR',
            responseCell:{column:rcol+1,row:g.cellRow[responseCell]+1},
            childClass:child.class,guardPreserved:true
          };
          break;
        }
      }
    }

    // Existing CPC-licensed response edges remain available. Preserve the
    // guard only if neither realized move consumes the guard column; otherwise
    // the exact child must close under ordinary S_(D-2).
    if(!found){
      for(const option of adaptiveResponseOptions(q,attacker,c)){
        guardResponses++;
        const tr=responseSuccessor(q,option.template,attacker,c);
        if(!tr.ok)continue;
        if(tr.closed){
          found={
            attackerColumn:c+1,responseColumn:tr.responseColumn,mode:'LICENSED_DROP',
            responseSource:option.source,closed:true
          };
          break;
        }
        const rc=tr.responseColumn-1;
        const preserve=c!==guardCol&&rc!==guardCol;
        const child=preserve
          ? classG(tr.q,attacker,D-2,guardCol)
          : (D-2===1
              ? {accept:surviveOne(tr.q,attacker),class:'ORDINARY_ONE'}
              : classS(tr.q,attacker,D-2));
        if(child.accept){
          found={
            attackerColumn:c+1,responseColumn:tr.responseColumn,
            mode:preserve?'LICENSED_GUARD_PRESERVE':'LICENSED_GUARD_DROP',
            responseSource:option.source,childClass:child.class
          };
          break;
        }
      }
    }

    if(!found){
      const r={accept:false,class:'GUARD_NO_RESPONSE',failedTrigger:c+1,guardHeight:h};
      guardMemo.set(mk,r);return r;
    }
    witnesses.push(found);
  }

  const r={accept:true,class:'ODD_ROW_GUARD_D'+D,guardColumn:guardCol+1,guardHeight:h,witnessByTrigger:witnesses};
  guardMemo.set(mk,r);return r;
}

const roots=[
  {id:'c6_r4_after_B1',sequence:'44444156661412',guardCol:1},
  {id:'c6_r4_after_C1',sequence:'44444156661413',guardCol:2},
  {id:'c6_r5_after_B1',sequence:'44444156661512',guardCol:1},
  {id:'c6_r5_after_C1',sequence:'44444156661513',guardCol:2},
  {id:'c6_r6_after_B1',sequence:'44444156661612',guardCol:1},
  {id:'c6_r6_after_C1',sequence:'44444156661613',guardCol:2},
];
const horizons=[];for(let d=1;d<=13;d+=2)horizons.push(d);
const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q),membership=[];
  assert.equal(rank(q),14);
  assert.equal(q.words[root.guardCol],1);
  for(const D of horizons){
    const c=classG(q,attacker,D,root.guardCol);
    membership.push({
      D,absolutePly:14+D,accept:c.accept,class:c.class,
      failedTrigger:c.failedTrigger??null,guardHeight:c.guardHeight??null,
      witnessByTrigger:c.witnessByTrigger??null
    });
  }
  rows.push({...root,guardColumn:root.guardCol+1,attacker:attacker+1,membership});
}

console.log(JSON.stringify({
  schema:'connect4.cpc_odd_row_guard_top_debt_d13_diagnostic.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  target:{rootRank:14,diagnosticMaxHorizon:13},
  rows,
  work:{
    guardCalls,guardMemoHits,guardBranchTests,guardResponses,topDebtTests,topDebtClosures,
    ordinary:{classCalls,memoHits,responseOptionsTested,branchTests,cofactorCount}
  },
  boundary:[
    'Odd-row guard state is carried as proof provenance during theorem qualification; production promotion requires reconstruction from current occupancy.',
    'Guard renewal is exact only for same-column attacker trigger followed by the immediately playable higher odd defender cell.',
    'External transitions use already licensed CPC response edges, the frozen support-lift blocker edge, and the frozen top-exhaustion phase-debt blocker repair edge; arbitrary defender responses are not admitted.',
    'Dropping a guard is permitted only when the exact child independently closes under the ordinary survival grammar (or exact one-ply survival at D=1).',
    'This is a constructive survival experiment, not W/D/L or exact remoteness.'
  ]
},null,2));
