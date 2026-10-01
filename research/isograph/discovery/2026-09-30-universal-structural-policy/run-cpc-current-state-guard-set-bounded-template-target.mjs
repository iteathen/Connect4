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
function keyOf(q){return Buffer.from(q.words.buffer,q.words.byteOffset,q.words.byteLength).toString('base64')+'|'+Buffer.from(q.basis.buffer,q.basis.byteOffset,q.basis.byteLength).toString('base64');}
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

const TEMPLATE_CACHE_MAX=2048;
const templateMemo=new Map();
function cacheTemplate(k,v){
  templateMemo.set(k,v);
  while(templateMemo.size>TEMPLATE_CACHE_MAX){
    const first=templateMemo.keys().next().value;
    templateMemo.delete(first);
  }
  return v;
}
function templates(q){
  const qk=keyOf(q);
  const prior=templateMemo.get(qk);if(prior)return prior;
  const rem=Array.from({length:g.columns},(_,c)=>g.rows-q.words[c]),odds=[],evens=[];
  for(let c=0;c<g.columns;c++){if(!rem[c])continue;(rem[c]&1?odds:evens).push(c);}
  if(odds.length&1){return cacheTemplate(qk,[]);}
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
  return cacheTemplate(qk,out);
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

const baseMemo={size:0};
function baseSafe(q,attacker,D){
  assert.equal(terminal(q),0);assert.equal(mover(q),attacker);
  const critical=activeMinimal(q,attacker)
    .map(id=>({id,deadline:earliest(q,id,attacker)}))
    .filter(x=>x.deadline!==null&&x.deadline<=D);
  if(!critical.length)return {safe:true};
  for(const T of templates(q)){
    if(critical.every(r=>covers(r.id,T)))return {safe:true};
  }
  return {safe:false};
}

let cofactorCount=0;
const cofactorMemo={size:0};
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

const responseOptionMemo={size:0};
function adaptiveResponseOptions(q,attacker,column){
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

  return [...byMate.values()];
}


const classMemo=new Map();
let classCalls=0,memoHits=0,branchTests=0,responseTests=0,cofactorTransitions=0;
let guardRenewCandidates=0,supportLiftCandidates=0,topDebtCandidates=0,ordinaryCandidates=0;

function attackerTerminalCode(attacker){return attacker===0?3:1;}

function oddBit(column,row0){
  assert((row0&1)===0 && row0>=0 && row0<6);
  return 1<<(column*3+(row0>>>1));
}
function maskMove(mask,column,row0,defenderMove){
  if((row0&1)!==0)return mask>>>0;
  const bit=oddBit(column,row0);
  return defenderMove?((mask|bit)>>>0):((mask&~bit)>>>0);
}
function maskAfterPair(q,mask,attackerColumn,responseColumn){
  const ar=q.words[attackerColumn];
  let out=maskMove(mask,attackerColumn,ar,false);
  const rr=responseColumn===attackerColumn?ar+1:q.words[responseColumn];
  out=maskMove(out,responseColumn,rr,true);
  return out>>>0;
}
function oddDefenderMaskFromSequence(sequence,attacker){
  const heights=new Uint8Array(g.columns);
  const defender=1-attacker;
  let mask=0;
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1,row=heights[c]++;
    assert(row<g.rows,'sequence overflow');
    if((row&1)===0){
      const bit=oddBit(c,row);
      if((i&1)===defender)mask|=bit;
      else mask&=~bit;
    }
  }
  return mask>>>0;
}
function guardColumns(q,mask){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const h=q.words[c];
    if(!(h>=1&&h<=5&&(h&1)))continue;
    let ok=true;
    for(let row=0;row<h;row+=2){
      if((mask&oddBit(c,row))===0){ok=false;break;}
    }
    if(ok)out.push(c);
  }
  return out;
}
function guardDescriptor(q,mask){
  return guardColumns(q,mask).map(c=>({column:c+1,height:q.words[c]}));
}
function noImmediateAttackerWin(q,attacker){
  for(const c of legal(q)){
    const first=cofactor(q,c);
    if(first.term===attackerTerminalCode(attacker))return false;
  }
  return true;
}
function tailClass(q,attacker,D,mask){
  if(D<=0)return {accept:true,class:'DONE'};
  if(D===1)return {accept:noImmediateAttackerWin(q,attacker),class:'NO_IMMEDIATE_ATTACKER_WIN'};
  return classM(q,attacker,D,mask);
}

function classM(q,attacker,D,mask){
  assert(D>=3&&(D&1));
  assert.equal(terminal(q),0);
  assert.equal(mover(q),attacker);
  const mk=keyOf(q)+'|A'+attacker+'|D'+D+'|GM'+(mask>>>0);
  if(classMemo.has(mk)){memoHits++;return classMemo.get(mk);}
  classCalls++;

  const pooled=pooledFrontierNoWin(q,attacker);
  if(pooled.accept){
    const r={accept:true,class:'GUARDSET_POOLED_FRONTIER_NOWIN'};
    classMemo.set(mk,r);return r;
  }
  const base=baseSafe(q,attacker,D);
  if(base.safe){
    const r={accept:true,class:'GUARDSET_B'+D};
    classMemo.set(mk,r);return r;
  }

  const guards=guardColumns(q,mask);
  const witnesses=[];

  for(const c of legal(q)){
    branchTests++;
    const first=cofactor(q,c);
    cofactorTransitions++;
    if(first.term===attackerTerminalCode(attacker)){
      const r={accept:false,class:'GUARDSET_ATTACKER_TERMINAL',failedTrigger:c+1};
      classMemo.set(mk,r);return r;
    }
    if(first.term){
      witnesses.push({attackerColumn:c+1,closed:true,mode:'ATTACKER_TRIGGER_TERMINAL'});
      continue;
    }

    const candidates=new Map();
    function addCandidate(rcol,source,meta=null){
      if(rcol<0||rcol>=g.columns||first.q.words[rcol]>=g.rows)return;
      let x=candidates.get(rcol);
      if(!x){x={rcol,sources:[],meta:[]};candidates.set(rcol,x);}
      if(!x.sources.includes(source))x.sources.push(source);
      if(meta)x.meta.push({source,...meta});
    }

    // Already-frozen CPC response grammar.
    for(const option of adaptiveResponseOptions(q,attacker,c)){
      const rcol=g.cellColumn[option.mate];
      const rr=g.cellRow[option.mate];
      if(first.q.words[rcol]!==rr)continue;
      ordinaryCandidates++;
      addCandidate(rcol,'CPC_RESPONSE',{responseSource:option.source,responseSources:option.sources??[option.source]});
    }

    // Any currently reconstructed guard can own its exact same-column renewal.
    if(guards.includes(c) && q.words[c]<5){
      guardRenewCandidates++;
      addCandidate(c,'GUARD_RENEW',{guardColumn:c+1,guardHeight:q.words[c]});
    }

    // Frozen support-lift blocker edge.
    if(first.q.words[c]<g.rows){
      const released=first.q.words[c]*g.columns+c;
      const attached=activeMinimal(first.q,attacker).some(id=>shapeCells(id).includes(released));
      if(attached){
        supportLiftCandidates++;
        addCandidate(c,'SUPPORT_LIFT_BLOCKER',{releasedCell:released});
      }
    }

    // Frozen top-exhaustion phase-debt repair. At least one previously carried
    // guard must survive untouched by trigger and response.
    if(first.q.words[c]===g.rows){
      const liveIds=activeMinimal(first.q,attacker);
      for(const rcol of legal(first.q)){
        if(rcol===c)continue;
        const preserved=guards.filter(gcol=>gcol!==c&&gcol!==rcol);
        if(!preserved.length)continue;
        const responseCell=first.q.words[rcol]*g.columns+rcol;
        if(!liveIds.some(id=>shapeCells(id).includes(responseCell)))continue;
        topDebtCandidates++;
        addCandidate(rcol,'TOP_DEBT_ATTACHED_REPAIR',{
          responseCell,
          preservingGuards:preserved.map(x=>x+1)
        });
      }
    }

    let found=null;
    for(const candidate of candidates.values()){
      responseTests++;
      const rcol=candidate.rcol;
      const responseRow=first.q.words[rcol];
      const second=cofactor(first.q,rcol);
      cofactorTransitions++;
      if(second.term){
        found={
          attackerColumn:c+1,responseColumn:rcol+1,closed:true,
          mode:'GUARDSET_RESPONSE',sources:candidate.sources,meta:candidate.meta,
          childClass:'CLOSED'
        };
        break;
      }
      const nextMask=maskAfterPair(q,mask,c,rcol);
      const child=tailClass(second.q,attacker,D-2,nextMask);
      if(child.accept){
        found={
          attackerColumn:c+1,responseColumn:rcol+1,closed:false,
          mode:'GUARDSET_RESPONSE',sources:candidate.sources,meta:candidate.meta,
          guardsBefore:guardDescriptor(q,mask),
          guardsAfter:guardDescriptor(second.q,nextMask),
          childClass:child.class
        };
        break;
      }
    }

    if(!found){
      const r={accept:false,class:'GUARDSET_RESPONSE_EXHAUSTED',failedTrigger:c+1};
      classMemo.set(mk,r);return r;
    }
    witnesses.push(found);
  }

  const r={accept:true,class:'GUARDSET_D'+D};
  classMemo.set(mk,r);return r;
}

const root={id:'candidate6',sequence:'4444415666'};
const D=Number(process.argv[3]??15);
assert(Number.isInteger(D)&&D>=1&&(D&1),'target D must be odd');
const q=ingress(root.sequence),attacker=mover(q);
const mask=oddDefenderMaskFromSequence(root.sequence,attacker);
const result=tailClass(q,attacker,D,mask);

console.log(JSON.stringify({
  schema:'connect4.cpc_current_state_guard_set_bounded_template_target.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  root:{...root,rank:rank(q),attacker:attacker+1,support:Array.from(q.words.slice(0,g.columns))},
  targetHorizon:D,
  absolutePly:rank(q)+D,
  initialOddDefenderMask:mask>>>0,
  initialGuards:guardDescriptor(q,mask),
  result,
  work:{
    classCalls,memoHits,branchTests,responseTests,cofactorTransitions,cofactorCount,
    guardRenewCandidates,supportLiftCandidates,topDebtCandidates,ordinaryCandidates,
    classMemoSize:classMemo.size,baseMemoSize:baseMemo.size,templateMemoSize:templateMemo.size,
    responseOptionMemoSize:0,cofactorMemoSize:0,templateCacheLimit:TEMPLATE_CACHE_MAX
  },
  boundary:[
    'The guard set and proof grammar are unchanged; this execution variant additionally bounds template retention and removes redundant base-state memoization.'
    'No new response type is introduced: all candidates belong to previously frozen CPC response, guard-renewal, support-lift, or top-debt theorems.',
    'Top-debt repair retains the existing premise that at least one carried guard survives trigger and response untouched.',
    'Acceptance is a constructive survival lower certificate only; rejection is not an attacker upper bound.'
  ]
},null,2));
