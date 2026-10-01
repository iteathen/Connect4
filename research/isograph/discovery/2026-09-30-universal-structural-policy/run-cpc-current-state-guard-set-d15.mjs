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
  return {words:q.words,basis:q.basis,positionLo:q.positionLo>>>0,positionHi:q.positionHi>>>0};
}
const rank=q=>q.words[g.metaOffset]>>>2;
const terminal=q=>q.words[g.metaOffset]&3;
const mover=q=>rank(q)&1;
function legal(q){const out=[];for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);return out;}
function keyOf(q){
  return Array.from(q.words).join(',')+'|'+Array.from(q.basis).join(',')+
    '|P'+(q.positionLo>>>0)+','+(q.positionHi>>>0);
}
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
function advancePositionCode(q,column,height,player){
  let lo=q.positionLo>>>0,hi=q.positionHi>>>0;
  const bit=g.positionBitBase[column]+height+player;
  if(bit<32){
    const delta=(1<<bit)>>>0,next=(lo+delta)>>>0;
    hi=(hi+(next<lo?1:0))>>>0;lo=next;
  }else{
    hi=(hi+((1<<(bit-32))>>>0))>>>0;
  }
  return {lo,hi};
}
function cofactor(q,column){
  const qk=keyOf(q),mk=qk+'|C'+column;
  if(cofactorMemo.has(mk))return cofactorMemo.get(mk);
  const height=q.words[column],player=mover(q);
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,column,height,
    words,0,basisBuf,0,seen,sizes,0
  );
  const position=advancePositionCode(q,column,height,player);
  cofactorCount++;
  const out={term,q:{
    words,basis:basisBuf.slice(0,sizes[0]),
    positionLo:position.lo,positionHi:position.hi
  }};
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

const gammaMemo=new Map();
let gammaCalls=0,gammaMemoHits=0,gammaBranchTests=0;
let guardRenewalTests=0,guardRenewalClosures=0;
let supportLiftTests=0,supportLiftClosures=0;
let topDebtTests=0,topDebtClosures=0;
let adaptiveTests=0,guardReconstructions=0;

function attackerTerminalCode(attacker){return attacker===0?3:1;}
function positionBit(q,bit){
  return bit<32?((q.positionLo>>>bit)&1):((q.positionHi>>>(bit-32))&1);
}
function reconstructGuards(q,attacker){
  guardReconstructions++;
  const defender=1-attacker,out=[];
  for(let c=0;c<g.columns;c++){
    const h=q.words[c];
    if(!(h>=1&&h<=5&&(h&1)))continue;
    let ok=true;
    for(let r=0;r<h;r+=2){
      const owner=positionBit(q,g.positionBitBase[c]+r);
      if(owner!==defender){ok=false;break;}
    }
    if(ok)out.push(c);
  }
  return out;
}
function noImmediateAttackerWin(q,attacker){
  for(const c of legal(q)){
    const first=cofactor(q,c);
    if(first.term===attackerTerminalCode(attacker))return false;
  }
  return true;
}
function gammaTail(q,attacker,D){
  if(D<=0)return {accept:true,class:'DONE',guards:reconstructGuards(q,attacker).map(x=>x+1)};
  if(D===1)return {
    accept:noImmediateAttackerWin(q,attacker),
    class:'GUARD_SET_NO_IMMEDIATE_ATTACKER_WIN',
    guards:reconstructGuards(q,attacker).map(x=>x+1)
  };
  return classGamma(q,attacker,D);
}
function childSummary(child,q){
  return {
    childClass:child.class,
    guardsAfter:child.guards??reconstructGuards(q,mover(q)).map(x=>x+1)
  };
}

function classGamma(q,attacker,D){
  assert(D>=3&&(D&1));
  assert.equal(terminal(q),0);
  assert.equal(mover(q),attacker);
  const mk=keyOf(q)+'|A'+attacker+'|GAMMA'+D;
  if(gammaMemo.has(mk)){gammaMemoHits++;return gammaMemo.get(mk);}
  gammaCalls++;

  const guards=reconstructGuards(q,attacker);
  const guardNumbers=guards.map(x=>x+1);

  const pooled=pooledFrontierNoWin(q,attacker);
  if(pooled.accept){
    const r={accept:true,class:'GUARD_SET_POOLED_FRONTIER_NOWIN',guards:guardNumbers};
    gammaMemo.set(mk,r);return r;
  }
  const base=baseSafe(q,attacker,D);
  if(base.safe){
    const r={accept:true,class:'GUARD_SET_B'+D,guards:guardNumbers,witness:base.pairs};
    gammaMemo.set(mk,r);return r;
  }

  const witnessByTrigger=[];
  for(const c of legal(q)){
    gammaBranchTests++;
    const first=cofactor(q,c);
    if(first.term===attackerTerminalCode(attacker)){
      const r={accept:false,class:'GUARD_SET_ATTACKER_TERMINAL',failedTrigger:c+1,guards:guardNumbers};
      gammaMemo.set(mk,r);return r;
    }
    if(first.term){
      witnessByTrigger.push({
        attackerColumn:c+1,closed:true,mode:'TRIGGER_TERMINAL',
        guardsBefore:guardNumbers
      });
      continue;
    }

    let found=null;
    const h=q.words[c];

    // Frozen odd-row guard renewal. The guard is a current-state predicate,
    // so no provenance tag is carried into the child.
    if(guards.includes(c)&&h<5){
      guardRenewalTests++;
      const second=cofactor(first.q,c);
      if(second.term){
        guardRenewalClosures++;
        found={
          attackerColumn:c+1,responseColumn:c+1,closed:true,
          mode:'GUARD_VERTICAL',guardsBefore:guardNumbers
        };
      }else{
        const child=gammaTail(second.q,attacker,D-2);
        if(child.accept){
          guardRenewalClosures++;
          found={
            attackerColumn:c+1,responseColumn:c+1,closed:false,
            mode:'GUARD_VERTICAL',guardsBefore:guardNumbers,
            ...childSummary(child,second.q)
          };
        }
      }
    }

    // Frozen support-lift blocker response.
    if(!found && first.q.words[c]<g.rows){
      const released=first.q.words[c]*g.columns+c;
      const attached=activeMinimal(first.q,attacker).some(id=>shapeCells(id).includes(released));
      if(attached){
        supportLiftTests++;
        const second=cofactor(first.q,c);
        if(second.term){
          supportLiftClosures++;
          found={
            attackerColumn:c+1,responseColumn:c+1,closed:true,
            mode:'SUPPORT_LIFT_BLOCKER',guardsBefore:guardNumbers,
            releasedCell:{column:c+1,row:g.cellRow[released]+1}
          };
        }else{
          const child=gammaTail(second.q,attacker,D-2);
          if(child.accept){
            supportLiftClosures++;
            found={
              attackerColumn:c+1,responseColumn:c+1,closed:false,
              mode:'SUPPORT_LIFT_BLOCKER',guardsBefore:guardNumbers,
              releasedCell:{column:c+1,row:g.cellRow[released]+1},
              ...childSummary(child,second.q)
            };
          }
        }
      }
    }

    // Frozen top-exhaustion phase-debt repair, generalized only by the frozen
    // guard-set theorem: one existing guard may retire while another current
    // guard supplies the required preserved resource.
    if(!found && first.q.words[c]===g.rows){
      const liveIds=activeMinimal(first.q,attacker);
      for(const rcol of legal(first.q)){
        if(rcol===c)continue;
        const preserving=guards.filter(gcol=>gcol!==c&&gcol!==rcol);
        if(!preserving.length)continue;
        const responseCell=first.q.words[rcol]*g.columns+rcol;
        if(!liveIds.some(id=>shapeCells(id).includes(responseCell)))continue;

        topDebtTests++;
        const second=cofactor(first.q,rcol);
        const preserved=preserving.filter(gcol=>
          first.q.words[gcol]===q.words[gcol] &&
          (second.term||reconstructGuards(second.q,attacker).includes(gcol))
        );
        if(!preserved.length)continue;

        if(second.term){
          topDebtClosures++;
          found={
            attackerColumn:c+1,responseColumn:rcol+1,closed:true,
            mode:'TOP_DEBT_ATTACHED_REPAIR',guardsBefore:guardNumbers,
            preservingGuards:preserved.map(x=>x+1),
            responseCell:{column:rcol+1,row:g.cellRow[responseCell]+1}
          };
          break;
        }
        const child=gammaTail(second.q,attacker,D-2);
        if(child.accept){
          topDebtClosures++;
          found={
            attackerColumn:c+1,responseColumn:rcol+1,closed:false,
            mode:'TOP_DEBT_ATTACHED_REPAIR',guardsBefore:guardNumbers,
            preservingGuards:preserved.map(x=>x+1),
            responseCell:{column:rcol+1,row:g.cellRow[responseCell]+1},
            ...childSummary(child,second.q)
          };
          break;
        }
      }
    }

    // Existing synchronized-template, frontier-residual, and cross-residual
    // ladder responses. Exact child occupancy reconstructs the complete guard
    // set; no selected guard is transported by history.
    for(const option of found?[]:adaptiveResponseOptions(q,attacker,c)){
      adaptiveTests++;
      const tr=responseSuccessor(q,option.template,attacker,c);
      if(!tr.ok)continue;
      if(tr.closed){
        found={
          attackerColumn:c+1,responseColumn:tr.responseColumn,closed:true,
          mode:'ADAPTIVE_RESPONSE',guardsBefore:guardNumbers,
          responseSource:option.source,responseSources:option.sources??[option.source]
        };
        break;
      }
      const child=gammaTail(tr.q,attacker,D-2);
      if(child.accept){
        found={
          attackerColumn:c+1,responseColumn:tr.responseColumn,closed:false,
          mode:'ADAPTIVE_RESPONSE',guardsBefore:guardNumbers,
          responseSource:option.source,responseSources:option.sources??[option.source],
          ...childSummary(child,tr.q)
        };
        break;
      }
    }

    if(!found){
      const r={
        accept:false,class:'GUARD_SET_RESPONSE_EXHAUSTED',
        failedTrigger:c+1,guards:guardNumbers
      };
      gammaMemo.set(mk,r);return r;
    }
    witnessByTrigger.push(found);
  }

  const r={
    accept:true,class:'CURRENT_STATE_GUARD_SET_'+D,
    guards:guardNumbers,witnessByTrigger
  };
  gammaMemo.set(mk,r);return r;
}

const cases=[
  {id:'candidate6_root',sequence:'4444415666',D:maxD},
  {id:'c6_a2_d3',sequence:'444441566623',D:Math.max(3,maxD-2)},
  {id:'c6_a2_d7',sequence:'444441566627',D:Math.max(3,maxD-2)},
];
const rows=[];
for(const item of cases){
  const q=ingress(item.sequence),attacker=mover(q);
  assert.equal(terminal(q),0);
  const guards=reconstructGuards(q,attacker);
  const r=classGamma(q,attacker,item.D);
  rows.push({
    ...item,
    attacker:attacker+1,
    support:Array.from(q.words.slice(0,g.columns)),
    positionCode:{lo:q.positionLo>>>0,hi:q.positionHi>>>0},
    reconstructedGuards:guards.map(x=>x+1),
    result:{
      accept:r.accept,class:r.class,
      failedTrigger:r.failedTrigger??null,
      guards:r.guards??null,
      witnessByTrigger:r.witnessByTrigger??null
    }
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_current_state_guard_set_d15.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  maxHorizon:maxD,
  rows,
  work:{
    cofactorCount,gammaCalls,gammaMemoHits,gammaBranchTests,
    guardRenewalTests,guardRenewalClosures,
    supportLiftTests,supportLiftClosures,
    topDebtTests,topDebtClosures,adaptiveTests,guardReconstructions,
    gammaMemoSize:gammaMemo.size,baseMemoSize:baseMemo.size,
    templateMemoSize:templateMemo.size,responseOptionMemoSize:responseOptionMemo.size,
    cofactorMemoSize:cofactorMemo.size
  },
  boundary:[
    'Colored occupancy is carried as the exact 49-bit gravity-valid position code and advanced directly by each cofactor; guard reconstruction does not use move history after ingress.',
    'The complete guard set is reconstructed from current colored occupancy after every exact nonterminal trigger/response child.',
    'No legal response is added beyond the already-frozen synchronized-template, residual-attachment, cross-residual ladder, odd-row guard, support-lift, and top-debt repair theorems.',
    'A positive consumed-boundary result still requires independent fresh multi-guard structural qualification before production promotion.',
    'Failure of this constructive survival class is not an attacker forced-completion certificate.'
  ]
},null,2));
