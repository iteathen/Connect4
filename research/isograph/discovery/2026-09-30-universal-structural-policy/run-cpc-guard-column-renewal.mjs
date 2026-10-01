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
      byMate.set(mate,{
        mate,template:T,source:'SYNCHRONIZED_TEMPLATE',sources:['SYNCHRONIZED_TEMPLATE'],
        residualId:null,crossLadder:null
      });
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
      if(byMate.has(mate)){
        const prior=byMate.get(mate);
        if(!prior.sources)prior.sources=[prior.source];
        if(!prior.sources.includes('FRONTIER_RESIDUAL_EDGE'))prior.sources.push('FRONTIER_RESIDUAL_EDGE');
        continue;
      }
      byMate.set(mate,{
        mate,
        source:'FRONTIER_RESIDUAL_EDGE',
        sources:['FRONTIER_RESIDUAL_EDGE'],
        crossLadder:null,
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
        const rc=g.cellColumn[mate],rr=g.cellRow[mate];
        const ladderWitness={
          lowerResidualId:lowId,
          middleResidualId:midId,
          triggerCell:frontier,
          responseCell:mate,
          transportedPair:upper.slice()
        };
        if(byMate.has(mate)){
          const prior=byMate.get(mate);
          if(!prior.sources)prior.sources=[prior.source];
          if(!prior.sources.includes('CROSS_RESIDUAL_LADDER_EDGE'))prior.sources.push('CROSS_RESIDUAL_LADDER_EDGE');
          if(!prior.crossLadder)prior.crossLadder=ladderWitness;
          continue;
        }
        byMate.set(mate,{
          mate,
          source:'CROSS_RESIDUAL_LADDER_EDGE',
          sources:['CROSS_RESIDUAL_LADDER_EDGE'],
          crossLadder:ladderWitness,
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

const classMemo=new Map(),guardMemo=new Map();
let classCalls=0,responseOptionsTested=0,branchTests=0,memoHits=0;
let guardCalls=0,guardMemoHits=0,guardBranchTests=0,guardForcedResponses=0,guardRetirements=0,guardEstablishments=0;

function attackerTerminalCode(attacker){return attacker===0?3:1;}
function noImmediateAttackerWin(q,attacker){
  for(const c of legal(q)){
    const first=cofactor(q,c);
    if(first.term===attackerTerminalCode(attacker))return false;
  }
  return true;
}
function ordinaryTail(q,attacker,D){
  if(D<=0)return {accept:true,class:'DONE'};
  if(D===1)return {accept:noImmediateAttackerWin(q,attacker),class:'NO_IMMEDIATE_ATTACKER_WIN'};
  return classS(q,attacker,D);
}
function guardTail(q,attacker,D,guardCol){
  if(D<=0)return {accept:true,class:'DONE'};
  if(D===1)return {accept:noImmediateAttackerWin(q,attacker),class:'GUARD_NO_IMMEDIATE_ATTACKER_WIN'};
  return classG(q,attacker,D,guardCol);
}

function classG(q,attacker,D,guardCol){
  assert(D>=3&&(D&1));
  assert.equal(terminal(q),0);
  assert.equal(mover(q),attacker);
  const h=q.words[guardCol];
  assert(h>=1&&h<=5&&(h&1)===1,'guard state requires odd nonfull height 1/3/5');

  const mk=keyOf(q)+'|A'+attacker+'|SG'+D+'|G'+guardCol;
  if(guardMemo.has(mk)){guardMemoHits++;return guardMemo.get(mk);}
  guardCalls++;

  const pooled=pooledFrontierNoWin(q,attacker);
  if(pooled.accept){
    const r={accept:true,class:'GUARD_POOLED_FRONTIER_NOWIN',guardCol:guardCol+1};
    guardMemo.set(mk,r);return r;
  }
  const base=baseSafe(q,attacker,D);
  if(base.safe){
    const r={accept:true,class:'GUARD_B'+D,guardCol:guardCol+1,witness:base.pairs};
    guardMemo.set(mk,r);return r;
  }

  const witnesses=[];
  for(const c of legal(q)){
    guardBranchTests++;

    // Guard-column trigger: attacker occupies the next even row. When an odd
    // guard cell remains above, the defender responds immediately in-column.
    if(c===guardCol && h<5){
      const first=cofactor(q,c);
      if(first.term===attackerTerminalCode(attacker)){
        const r={accept:false,class:'GUARD_ATTACKER_TERMINAL',failedTrigger:c+1,guardCol:guardCol+1};
        guardMemo.set(mk,r);return r;
      }
      if(first.term){
        witnesses.push({attackerColumn:c+1,closed:true,mode:'GUARD_TRIGGER_TERMINAL'});
        continue;
      }
      assert.equal(first.q.words[guardCol],h+1);
      const second=cofactor(first.q,guardCol);
      guardForcedResponses++;
      if(second.term){
        witnesses.push({attackerColumn:c+1,responseColumn:c+1,closed:true,mode:'GUARD_VERTICAL'});
        continue;
      }
      assert.equal(second.q.words[guardCol],h+2);
      const child=guardTail(second.q,attacker,D-2,guardCol);
      if(!child.accept){
        const r={accept:false,class:'GUARD_CHILD_FAIL',failedTrigger:c+1,guardCol:guardCol+1,childClass:child.class};
        guardMemo.set(mk,r);return r;
      }
      witnesses.push({attackerColumn:c+1,responseColumn:c+1,closed:false,mode:'GUARD_VERTICAL',childClass:child.class});
      continue;
    }

    // External trigger, or top-row guard trigger.
    // First admit the frozen support-lift blocker edge: after the attacker
    // trigger, the uniquely released same-column cell may be occupied by the
    // defender iff it belongs to a live attacker residual in the exact
    // post-trigger state. This preserves the guard when c is external.
    let found=null;
    const firstExternal=cofactor(q,c);
    if(firstExternal.term===attackerTerminalCode(attacker)){
      const r={accept:false,class:'GUARD_ATTACKER_TERMINAL',failedTrigger:c+1,guardCol:guardCol+1};
      guardMemo.set(mk,r);return r;
    }
    if(firstExternal.term){
      found={attackerColumn:c+1,closed:true,mode:'SUPPORT_LIFT_TRIGGER_TERMINAL',childClass:'CLOSED'};
    }else if(firstExternal.q.words[c]<g.rows){
      const released=firstExternal.q.words[c]*g.columns+c;
      const attached=activeMinimal(firstExternal.q,attacker).some(id=>shapeCells(id).includes(released));
      if(attached){
        const second=cofactor(firstExternal.q,c);
        guardForcedResponses++;
        if(second.term){
          found={
            attackerColumn:c+1,responseColumn:c+1,closed:true,
            mode:'SUPPORT_LIFT_BLOCKER',releasedCell:{column:c+1,row:g.cellRow[released]+1},
            childClass:'CLOSED'
          };
        }else{
          const topGuardTrigger=(c===guardCol&&h===5);
          const preservesGuard=!topGuardTrigger&&c!==guardCol;
          const child=preservesGuard
            ?guardTail(second.q,attacker,D-2,guardCol)
            :ordinaryTail(second.q,attacker,D-2);
          if(child.accept){
            if(!preservesGuard)guardRetirements++;
            found={
              attackerColumn:c+1,responseColumn:c+1,closed:false,
              mode:'SUPPORT_LIFT_BLOCKER',
              releasedCell:{column:c+1,row:g.cellRow[released]+1},
              childClass:child.class,guardPreserved:preservesGuard
            };
          }
        }
      }
    }

    // Existing CPC response edges remain available if the support-lift edge
    // does not close the branch. If the realized response consumes the guard
    // column outside the forced guard transition, retire the guard and require
    // the exact child to survive under the ordinary class.
    for(const option of found?[]:adaptiveResponseOptions(q,attacker,c)){
      responseOptionsTested++;
      const tr=responseSuccessor(q,option.template,attacker,c);
      if(!tr.ok)continue;
      if(tr.closed){
        found={attackerColumn:c+1,responseColumn:tr.responseColumn,closed:true,mode:'GUARD_COMPOSED',responseSource:option.source,responseSources:option.sources??[option.source],childClass:'CLOSED'};
        break;
      }
      const responseCol=tr.responseColumn-1;
      const topGuardTrigger=(c===guardCol&&h===5);
      const preservesGuard=!topGuardTrigger&&responseCol!==guardCol;
      const child=preservesGuard
        ?guardTail(tr.q,attacker,D-2,guardCol)
        :ordinaryTail(tr.q,attacker,D-2);
      if(child.accept){
        if(!preservesGuard)guardRetirements++;
        found={
          attackerColumn:c+1,responseColumn:tr.responseColumn,closed:false,
          mode:preservesGuard?'GUARD_PRESERVED':'GUARD_RETIRED',
          responseSource:option.source,responseSources:option.sources??[option.source],childClass:child.class
        };
        break;
      }
    }
    if(!found){
      const r={accept:false,class:'GUARD_RESPONSE_EXHAUSTED',failedTrigger:c+1,guardCol:guardCol+1};
      guardMemo.set(mk,r);return r;
    }
    witnesses.push(found);
  }

  const r={accept:true,class:'ODD_ROW_GUARD_'+D,guardCol:guardCol+1,witnessByTrigger:witnesses};
  guardMemo.set(mk,r);return r;
}

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
          templatePairs:option.template.pairs,responseSource:option.source,responseSources:option.sources??[option.source],childClass:'CLOSED'
        };
        break;
      }
      const establishesGuard=
        option.crossLadder!==null &&
        option.crossLadder!==undefined &&
        g.cellRow[option.mate]===0 &&
        tr.responseColumn!==null;
      const child=establishesGuard
        ?guardTail(tr.q,attacker,D-2,g.cellColumn[option.mate])
        :ordinaryTail(tr.q,attacker,D-2);
      if(child.accept){
        if(establishesGuard)guardEstablishments++;
        found={
          attackerColumn:c+1,responseColumn:tr.responseColumn,closed:false,
          templatePairs:option.template.pairs,responseSource:option.source,responseSources:option.sources??[option.source],
          establishesGuard:establishesGuard?g.cellColumn[option.mate]+1:null,
          childClass:child.class
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

const roots=[
  {id:'candidate2',sequence:'4444415662'},
  {id:'candidate3',sequence:'4444415663'},
  {id:'candidate6',sequence:'4444415666'},
];
const horizons=[];for(let d=3;d<=maxD;d+=2)horizons.push(d);
const rows=[];
for(const root of roots){
  const q=ingress(root.sequence),attacker=mover(q),membership=[];
  for(const D of horizons){
    const c=classS(q,attacker,D);
    membership.push({D,accept:c.accept,class:c.class,witness:c.witness??null,witnessByTrigger:c.witnessByTrigger??null,failedTrigger:c.failedTrigger??null});
  }
  rows.push({...root,attacker:attacker+1,membership});
}

const failureFrontiers=[];
for(const row of rows){
  const failure=row.membership.find((m,i)=>!m.accept&&i>0&&row.membership[i-1].accept);
  if(!failure||!failure.failedTrigger)continue;
  const q=ingress(row.sequence),attacker=mover(q),column=failure.failedTrigger-1;
  const options=[];
  for(const option of adaptiveResponseOptions(q,attacker,column)){
    const tr=responseSuccessor(q,option.template,attacker,column);
    if(!tr.ok){
      options.push({
        responseColumn:g.cellColumn[option.mate]+1,
        templatePairs:option.template.pairs,
        responseSource:option.source,responseSources:option.sources??[option.source],
        transport:'REJECTED',
        reason:tr.reason,
      });
      continue;
    }
    if(tr.closed){
      options.push({
        responseColumn:tr.responseColumn,
        templatePairs:option.template.pairs,
        responseSource:option.source,responseSources:option.sources??[option.source],
        transport:'CLOSED',
        reason:tr.reason,
      });
      continue;
    }
    const child=classS(tr.q,attacker,failure.D-2);
    const childSpectrum=[];
    for(let d=3;d<=failure.D-2;d+=2){
      const cd=classS(tr.q,attacker,d);
      childSpectrum.push({D:d,accept:cd.accept,class:cd.class,failedTrigger:cd.failedTrigger??null});
    }
    const deadlines={};
    for(const id of activeMinimal(tr.q,attacker)){
      const d=earliest(tr.q,id,attacker);
      if(d!==null)deadlines[d]=(deadlines[d]??0)+1;
    }
    options.push({
      responseColumn:tr.responseColumn,
      templatePairs:option.template.pairs,
      transport:'NONTERMINAL',
      childRank:rank(tr.q),
      childSupport:Array.from(tr.q.words.slice(0,g.columns)),
      childCpc:cpcSummary(tr.q),
      childTargetClass:{D:failure.D-2,accept:child.accept,class:child.class,failedTrigger:child.failedTrigger??null},
      childSpectrum,
      attackerMinimalResidualCount:activeMinimal(tr.q,attacker).length,
      attackerDeadlineHistogram:deadlines,
    });
  }
  failureFrontiers.push({
    id:row.id,
    sequence:row.sequence,
    failedHorizon:failure.D,
    failedTrigger:failure.failedTrigger,
    requiredChildHorizon:failure.D-2,
    responseOptions:options,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_guard_column_support_lift_renewal_spectrum.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  requestedMaxHorizon:maxD,
  horizons,
  rows,
  failureFrontiers,
  work:{
    classCalls,memoHits,responseOptionsTested,branchTests,cofactorCount,
    guardCalls,guardMemoHits,guardBranchTests,guardForcedResponses,guardRetirements,guardEstablishments,
    classMemoSize:classMemo.size,guardMemoSize:guardMemo.size,baseMemoSize:baseMemo.size,templateMemoSize:templateMemo.size,
    responseOptionMemoSize:responseOptionMemo.size,cofactorMemoSize:cofactorMemo.size
  },
  boundary:[
    'S_D is a constructive defender survival proof class; POOLED_FRONTIER_NOWIN is an independently qualified unbounded no-win base certificate.',
    'Response options are complete synchronized-template mates, exact same-residual frontier attachment edges, and exact +2-row cross-residual ladder edges; every transported child must independently re-enter the survival class.',
    'Each observed attacker trigger may select its own complete synchronized-response template; the exact mate is then transported by CPC/RBA cofactor.',
    'Failure of S_D is not an attacker forced-completion certificate.',
    'The spectrum composes trigger-adaptive synchronized responses, pooled-frontier no-win closure, lineage-preserving cross-residual ladder establishment, the odd-row guard-column temporal contract, and the frozen support-lift blocker response; it is not unrestricted legal-response minimax.',
    'The odd-row guard is frozen theorem-candidate scope. Positive extension requires fresh structural qualification and current-occupancy reconstruction before promotion.'
  ]
},null,2));
