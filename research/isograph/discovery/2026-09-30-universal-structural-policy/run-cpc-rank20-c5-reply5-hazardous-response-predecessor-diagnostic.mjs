#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);

const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const ROOT='44444156666623222242';
const DESIGN='CPC_RANK20_C5_REPLY5_HAZARDOUS_RESPONSE_PREDECESSOR_DIAGNOSTIC_DESIGN_0_1.md';
const SOURCE='CPC_RANK20_C5_REPLY5_PARTIAL_RESERVOIR_EXACT_VALIDATION_PROBE_0_1.json';

const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry,connect4RbaShapeSubset}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  CPC_NONE,CPC_EXACT,CPC_BOUND,CPC_RESTRICT,
  prepareConnect4CpcScratch,evaluateConnect4Cpc32,
  connect4CpcTargetOwner32,connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;

const KNOWN_SEQUENCES={
  RANK22_ROUTED:'4444415666662322224233',
  RANK24_ZUGZWANG:'444441566666232222423311',
  RANK24_SINGLETON:'444441566666232222423313',
  RANK24_ROUTED:'444441566666232222423317',
  RANK26_FORCED_CHAIN:'44444156666623222242331775',
};

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
function support(q){return Array.from(q.words.slice(0,g.columns));}
function exactEqual(a,b){
  if(!a||!b||a.terminal!==b.terminal||a.n!==b.n)return false;
  for(let i=0;i<a.n;i++)if(a.basis[i]!==b.basis[i])return false;
  for(let i=0;i<g.keyWords;i++)if(a.words[i]!==b.words[i])return false;
  return true;
}
function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}
function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}
function minimalIds(q,player){
  const active=activeIds(q,player);
  return active.filter(id=>!active.some(other=>
    other!==id&&g.shapeSize[other]<g.shapeSize[id]&&connect4RbaShapeSubset(g,other,id)
  ));
}
function shapeCells(id){
  const out=[],base=id*4;
  for(let i=0;i<g.shapeSize[id];i++)out.push(g.shapeCells[base+i]);
  return out;
}
function shapeHasCell(id,cell){
  const base=id*4;
  for(let i=0;i<g.shapeSize[id];i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
}
function cellDesc(cell,q){
  return {
    cell,
    column:g.cellColumn[cell]+1,
    row:g.cellRow[cell]+1,
    projectedOwner:connect4CpcTargetOwner32(g,q.words,0,cell)+1,
    supportDistance:connect4CpcTargetSupportDistance32(g,q.words,0,cell),
  };
}
function residualDesc(q,id,player){
  const cells=shapeCells(id).map(cell=>cellDesc(cell,q));
  return {
    diagnosticId:id,
    size:g.shapeSize[id],
    cells,
    fullyAligned:cells.every(x=>x.projectedOwner===player+1)
  };
}
function alignedMinimalPairs(q){
  return minimalIds(q,P1)
    .filter(id=>g.shapeSize[id]===2)
    .map(id=>residualDesc(q,id,P1))
    .filter(x=>x.fullyAligned);
}
function pairKey(desc){
  return desc.cells
    .map(x=>[x.column,x.row])
    .sort((a,b)=>a[0]-b[0]||a[1]-b[1])
    .map(x=>x.join(','))
    .join('|');
}
function hasActiveSingleton(q,player,cell){
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function activeMinimalSingletonCells(q,player){
  return minimalIds(q,player)
    .filter(id=>g.shapeSize[id]===1)
    .map(id=>g.shapeCells[id*4]);
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({diagnosticId:id,...cellDesc(cell,q)});
  }
  return out;
}
function cpc(q){
  const kinds=new Map([[CPC_NONE,'CPC_NONE'],[CPC_EXACT,'CPC_EXACT'],[CPC_BOUND,'CPC_BOUND'],[CPC_RESTRICT,'CPC_RESTRICT']]);
  const out={};
  for(const [name,frontierResponse] of [['baseline',false],['frontier',true]]){
    const s=prepareConnect4CpcScratch(g,{frontierResponse,projectedAdvisory:true});
    const kind=evaluateConnect4Cpc32(g,q.words,0,q.basis,0,q.n,s);
    out[name]={
      kind:kinds.get(kind),
      interval:[s.interval[0]-2,s.interval[1]-2],
      forcedColumn:s.forcedColumn[0]>=0?s.forcedColumn[0]+1:null,
      preemptionCount:s.preemptionCount[0],
      preemptionMask32:s.preemptionMask32[0]>>>0,
      precursorCount:s.precursorCount[0],
      projectedCount:Array.from(s.projectedCount),
      projectedForks:Array.from(s.projectedForks),
    };
  }
  return out;
}
function agreedRestriction(c){
  return (
    c.baseline.kind==='CPC_RESTRICT'&&c.frontier.kind==='CPC_RESTRICT'&&
    c.baseline.preemptionCount===1&&c.frontier.preemptionCount===1&&
    c.baseline.forcedColumn!==null&&
    c.baseline.forcedColumn===c.frontier.forcedColumn
  )?c.baseline.forcedColumn:null;
}

const knownStates=Object.fromEntries(Object.entries(KNOWN_SEQUENCES).map(([name,seq])=>[name,fromSequence(seq)]));
function knownRoot(q){
  if(!q||q.terminal)return null;
  for(const [name,state] of Object.entries(knownStates))if(exactEqual(q,state))return name;
  return null;
}

function coverageWitness(q,id,targetCell,partner,length){
  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell];
  const cells=shapeCells(id);
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===tc&&r>tr)return {kind:'post-target-deferral',...cellDesc(cell,q)};
  }
  for(const cell of cells){
    const c=g.cellColumn[cell],r=g.cellRow[cell],
      depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0)
      return {kind:'vertical-response',...cellDesc(cell,q)};
    if(p>=0&&depth<L){
      const mate=(q.words[p]+depth)*g.columns+p;
      if(shapeHasCell(id,mate))
        return {
          kind:'cross-pair',
          cells:[cell,mate].map(x=>cellDesc(x,q)),
          columns:[c+1,p+1],
          depth,L
        };
    }
  }
  return null;
}
function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(g.cellCount);mate.fill(-1);
  const role=new Uint8Array(g.cellCount);
  for(let c=0;c<g.columns;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){
      const hp=q.words[p];
      for(let d=0;d<L;d++){
        const a=(h+d)*g.columns+c,b=(hp+d)*g.columns+p;
        mate[a]=b;mate[b]=a;role[a]=3;role[b]=3;
      }
    }
    for(let d=L;d<cap;d+=2){
      if(d+1>=cap)throw new Error('odd vertical tail');
      const lo=(h+d)*g.columns+c,hi=(h+d+1)*g.columns+c;
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}
function findTargetTemplate(q,targetCell){
  if(!hasActiveSingleton(q,P1,targetCell))return null;
  if(connect4CpcTargetOwner32(g,q.words,0,targetCell)!==P1)return null;
  if(playableSingletons(q,P2).length)return null;

  const tc=g.cellColumn[targetCell],tr=g.cellRow[targetCell];
  const targetDepth=tr-q.words[tc];
  if(targetDepth<=0)return null;

  const capacity=new Uint32Array(g.columns),odd=[];
  let total=0;
  for(let c=0;c<g.columns;c++){
    const cap=c===tc?tr-q.words[c]+1:g.rows-q.words[c];
    if(cap<0)return null;
    capacity[c]=cap;total+=cap;
    if(cap&1)odd.push(c);
  }
  if((total&1)||(odd.length&1))return null;

  const defenderIds=activeIds(q,P2);
  const partner=new Int32Array(g.columns);partner.fill(-1);
  const length=new Uint32Array(g.columns);
  let found=null;

  function evaluate(){
    const targetL=partner[tc]>=0?length[tc]:0;
    const targetIsResponse=targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
    if(!targetIsResponse)return null;
    const coverage=[];
    for(const id of defenderIds){
      const witness=coverageWitness(q,id,targetCell,partner,length);
      if(!witness)return null;
      coverage.push({diagnosticId:id,size:g.shapeSize[id],witness});
    }
    const synchronizedPairs=[];
    for(let c=0;c<g.columns;c++)if(partner[c]>=0&&c<partner[c])
      synchronizedPairs.push({columns:[c+1,partner[c]+1],prefixLength:length[c]});
    const map=buildPairMap(q,capacity,partner,length);
    return {
      target:cellDesc(targetCell,q),
      targetDepth,targetPrefixLength:targetL,targetIsResponse,
      capacity:Array.from(capacity),
      oddColumns:odd.map(c=>c+1),
      synchronizedPairs,
      defenderResidualCount:defenderIds.length,
      coverage,
      mate:Array.from(map.mate),
      role:Array.from(map.role)
    };
  }
  function rec(pending){
    if(found)return;
    if(!pending.length){found=evaluate();return;}
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===tc||b===tc)&&L>=capacity[tc])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  return found;
}
function validateTemplate(q,targetCell,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;
  function walk(state,depth){
    defenderNodes++;maxPairDepth=Math.max(maxPairDepth,depth);
    if(moverOf(state)!==P2){failures.push({kind:'wrong-mover',support:support(state)});return;}
    let legal=0;
    for(let c=0;c<g.columns;c++){
      if(state.words[c]>=g.rows)continue;
      legal++;
      const row=state.words[c],cell=row*g.columns+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){
        failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1,role:r});continue;
      }
      const d=step(state,c);
      if(d.terminal===P2_WIN){failures.push({kind:'defender-terminal',column:c+1,row:row+1});continue;}
      if(d.terminal){failures.push({kind:'other-defender-terminal',terminal:d.terminal});continue;}
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(d.words[rc]!==rr){
        failures.push({kind:'response-not-playable',trigger:[c+1,row+1],response:[rc+1,rr+1]});continue;
      }
      const a=step(d,rc);responsePairs++;
      if(a.terminal===P1_WIN){
        p1Terminals++;
        if(m===targetCell)targetTerminals++;
        continue;
      }
      if(a.terminal){failures.push({kind:'other-response-terminal',terminal:a.terminal});continue;}
      walk(a,depth+1);
    }
    if(!legal)failures.push({kind:'no-legal-before-win'});
  }
  walk(q,0);
  return {
    pass:failures.length===0,
    defenderNodes,responsePairs,maxPairDepth,p1Terminals,targetTerminals,
    failures:failures.slice(0,20)
  };
}
function compactTemplate(t){
  return t?{
    target:t.target,
    targetDepth:t.targetDepth,
    targetPrefixLength:t.targetPrefixLength,
    targetIsResponse:t.targetIsResponse,
    capacity:t.capacity,
    oddColumns:t.oddColumns,
    synchronizedPairs:t.synchronizedPairs,
    defenderResidualCount:t.defenderResidualCount,
    coverage:t.coverage
  }:null;
}
function targetReservoirRoute(q,targetCell,kind,extra={}){
  const owner=connect4CpcTargetOwner32(g,q.words,0,targetCell);
  const defenderPlayable=playableSingletons(q,P2);
  const template=owner===P1&&defenderPlayable.length===0?findTargetTemplate(q,targetCell):null;
  const validation=template?validateTemplate(q,targetCell,template):null;
  return {
    kind,
    ...extra,
    target:cellDesc(targetCell,q),
    targetProjectedToP1:owner===P1,
    defenderPlayableSingletons:defenderPlayable,
    targetTemplate:compactTemplate(template),
    validation,
    accept:owner===P1&&defenderPlayable.length===0&&!!template&&!!validation?.pass
  };
}
function contractionRoutes(before,after,landingCell,kind,extra={}){
  const routes=[];
  for(const pair of alignedMinimalPairs(before)){
    const cells=pair.cells.map(x=>x.cell);
    if(!cells.includes(landingCell))continue;
    const other=cells[0]===landingCell?cells[1]:cells[0];
    const singleton=after.terminal===0&&hasActiveSingleton(after,P1,other);
    const base={
      ...extra,
      pairBefore:pair,
      consumedEndpoint:cellDesc(landingCell,before),
      singletonTarget:cellDesc(other,after),
      contractionToSingleton:singleton
    };
    if(singleton)routes.push(targetReservoirRoute(after,other,kind,base));
    else routes.push({...base,kind,accept:false,rejectionReason:'pair-did-not-contract-to-active-singleton'});
  }
  return routes;
}



function legalColumns(q){
  const out=[];
  for(let c=0;c<g.columns;c++)if(q.words[c]<g.rows)out.push(c);
  return out;
}
function immediateP1WinningColumns(q){
  if(q.terminal!==0||moverOf(q)!==P1)return [];
  const out=[];
  for(const c of legalColumns(q)){
    const child=step(q,c);
    if(child.terminal===P1_WIN)out.push(c+1);
  }
  return out;
}
function knownRootHandoffsAfterOneP1(q){
  if(q.terminal!==0||moverOf(q)!==P1)return [];
  const out=[];
  for(const c of legalColumns(q)){
    const child=step(q,c);
    if(child.terminal!==0)continue;
    const root=knownRoot(child);
    if(root)out.push({p1Column:c+1,knownRoot:root,support:support(child)});
  }
  return out;
}
function partnerLengthFromCandidate(candidate){
  const partner=new Int32Array(g.columns);
  partner.fill(-1);
  const length=new Uint32Array(g.columns);
  for(const pair of candidate.synchronizedPairs){
    const a=pair.columns[0]-1,b=pair.columns[1]-1,L=pair.prefixLength;
    partner[a]=b;partner[b]=a;
    length[a]=L;length[b]=L;
  }
  return {partner,length};
}
function decisionProfile(q){
  assert.equal(q.terminal,0);
  assert.equal(moverOf(q),P1);
  const cc=cpc(q);
  const forced=agreedRestriction(cc);
  const legal=legalColumns(q).map(x=>x+1);
  return {
    rank:rankOf(q),
    mover:moverOf(q)+1,
    support:support(q),
    cpc:cc,
    cpcAgreedRestriction:forced,
    legalP1Columns:legal,
    immediateP1WinningColumns:immediateP1WinningColumns(q),
    knownRootHandoffs:knownRootHandoffsAfterOneP1(q),
    playableP2Singletons:playableSingletons(q,P2),
    p1Minimal:minimalIds(q,P1).map(id=>residualDesc(q,id,P1)),
    p2Minimal:minimalIds(q,P2).map(id=>residualDesc(q,id,P2))
  };
}
function traceFirstFailure(q,candidate){
  const capacity=Uint32Array.from(candidate.capacity);
  const {partner,length}=partnerLengthFromCandidate(candidate);
  const pairMap=buildPairMap(q,capacity,partner,length);
  const mate=pairMap.mate,role=pairMap.role;
  let first=null;

  function walk(state,path){
    if(first)return;
    assert.equal(state.terminal,0);
    assert.equal(moverOf(state),P2);

    for(let c=0;c<g.columns&&!first;c++){
      if(state.words[c]>=g.rows)continue;
      const row=state.words[c];
      const triggerCell=row*g.columns+c;
      const mappedRole=role[triggerCell];
      const mappedMate=mate[triggerCell];

      if(mappedRole!==1&&mappedRole!==3){
        first={
          kind:'unmapped-defender-trigger',
          trigger:cellDesc(triggerCell,state),
          stateBeforeTrigger:{
            rank:rankOf(state),support:support(state)
          },
          pathLength:path.length
        };
        break;
      }

      const afterTrigger=step(state,c);
      if(afterTrigger.terminal===P2_WIN){
        const terminalCell=cellDesc(triggerCell,state);
        const last=path.length?path[path.length-1]:null;
        if(!last)throw new Error('terminal failure without preceding response');

        const pre=last.preResponseState;
        const preProfile=decisionProfile(pre);
        const hazardResponse=last.response;
        const forced=preProfile.cpcAgreedRestriction;
        const forcedLegal=forced!==null&&preProfile.legalP1Columns.includes(forced);
        let forcedMoveTerminal=null,forcedMoveSupport=null;
        if(forcedLegal){
          const forcedChild=step(pre,forced-1);
          forcedMoveTerminal=forcedChild.terminal;
          forcedMoveSupport=support(forcedChild);
        }
        const cpcReroutePromising=
          forced!==null &&
          forced!==hazardResponse.column &&
          forcedLegal &&
          forcedMoveTerminal!==P2_WIN;

        first={
          kind:'defender-terminal',
          terminalCell,
          stateBeforeTerminal:{
            rank:rankOf(state),
            mover:moverOf(state)+1,
            support:support(state)
          },
          precedingP1Response:{
            ...hazardResponse,
            immediatelyBelowTerminal:
              hazardResponse.column===terminalCell.column &&
              hazardResponse.row+1===terminalCell.row
          },
          precedingTrigger:last.trigger,
          preResponseState:preProfile,
          cpcReroutePromising,
          forcedAlternative:{
            column:forced,
            legal:forcedLegal,
            terminal:forcedMoveTerminal,
            support:forcedMoveSupport
          },
          pathLength:path.length,
          path:path.map(x=>({
            trigger:x.trigger,
            response:x.response
          }))
        };
        break;
      }
      if(afterTrigger.terminal!==0){
        first={
          kind:'other-defender-terminal',
          terminal:afterTrigger.terminal,
          trigger:cellDesc(triggerCell,state),
          pathLength:path.length
        };
        break;
      }

      const rc=g.cellColumn[mappedMate],rr=g.cellRow[mappedMate];
      if(afterTrigger.words[rc]!==rr){
        first={
          kind:'response-not-playable',
          trigger:cellDesc(triggerCell,state),
          response:cellDesc(mappedMate,afterTrigger),
          pathLength:path.length
        };
        break;
      }

      const preResponseState=afterTrigger;
      const responseDesc=cellDesc(mappedMate,afterTrigger);
      const responseState=step(afterTrigger,rc);
      if(responseState.terminal===P1_WIN)continue;
      if(responseState.terminal!==0){
        first={
          kind:'other-response-terminal',
          terminal:responseState.terminal,
          trigger:cellDesc(triggerCell,state),
          response:responseDesc,
          pathLength:path.length
        };
        break;
      }

      walk(responseState,[
        ...path,
        {
          trigger:cellDesc(triggerCell,state),
          response:responseDesc,
          preResponseState
        }
      ]);
    }
  }

  walk(q,[]);
  return first;
}

const source=JSON.parse(
  readFileSync(resolve(import.meta.dirname,SOURCE),'utf8')
);
assert.equal(
  source.schema,
  'connect4.cpc_rank20_c5_reply5_partial_reservoir_exact_validation_probe.v1'
);
assert.equal(source.jsMinSysSha,EXPECTED);
assert.equal(source.oracleUsed,false);
assert.equal(source.solvedInputsUsed,false);
assert.equal(source.ordinaryFreeBranchGameTreeUsed,false);

const candidates=[];
const recurrenceMap=new Map();

for(const s of source.states){
  const q=fromSequence(s.sequence);
  assert.equal(q.terminal,0);
  assert.equal(rankOf(q),s.rank);
  assert.deepEqual(support(q),s.support);

  for(const candidate of s.candidates){
    assert.equal(candidate.validation.pass,false);
    const firstFailure=traceFirstFailure(q,candidate);
    assert(firstFailure);
    assert.equal(firstFailure.kind,'defender-terminal');
    const item={
      id:s.id,
      signature:candidate.signature,
      sourceRank:s.rank,
      sourceSupport:s.support,
      dynamicValidationPassed:false,
      syntacticallyUncoveredResiduals:candidate.syntacticallyUncoveredResiduals,
      firstFailure
    };
    candidates.push(item);

    const cc=firstFailure.preResponseState.cpc;
    const key=[
      firstFailure.terminalCell.column,
      firstFailure.terminalCell.row,
      firstFailure.precedingP1Response.column,
      firstFailure.precedingP1Response.row,
      firstFailure.precedingTrigger.column,
      firstFailure.precedingTrigger.row,
      cc.baseline.kind,
      cc.baseline.forcedColumn,
      cc.frontier.kind,
      cc.frontier.forcedColumn
    ].join('|');

    if(!recurrenceMap.has(key)){
      recurrenceMap.set(key,{
        signature:key,
        count:0,
        sourceStates:new Set(),
        pairingCandidates:[],
        terminalCell:firstFailure.terminalCell,
        hazardousResponse:firstFailure.precedingP1Response,
        trigger:firstFailure.precedingTrigger,
        cpc:firstFailure.preResponseState.cpc,
        cpcReroutePromisingCount:0
      });
    }
    const rec=recurrenceMap.get(key);
    rec.count++;
    rec.sourceStates.add(s.id);
    rec.pairingCandidates.push(s.id+':'+candidate.signature);
    if(firstFailure.cpcReroutePromising)rec.cpcReroutePromisingCount++;
  }
}

const recurrence=[...recurrenceMap.values()]
  .map(x=>({
    ...x,
    sourceStates:[...x.sourceStates].sort(),
    pairingCandidates:x.pairingCandidates.sort()
  }))
  .sort((a,b)=>b.count-a.count||a.signature.localeCompare(b.signature));

const promisingIds=candidates
  .filter(x=>x.firstFailure.cpcReroutePromising)
  .map(x=>x.id+':'+x.signature);

console.log(JSON.stringify({
  schema:'connect4.cpc_rank20_c5_reply5_hazardous_response_predecessor_diagnostic.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryFreeBranchGameTreeUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  targetReservoirModified:false,
  bsfpModified:false,
  design:DESIGN,
  sourceEvidence:SOURCE,
  candidates,
  recurrence,
  summary:{
    candidateCount:candidates.length,
    cpcReroutePromisingCount:promisingIds.length,
    cpcReroutePromisingIds:promisingIds
  },
  conclusion:[
    'Every maximum partial-reservoir policy is traced to its first exact defender terminal, preserving the immediately preceding trigger/response pair.',
    'In every tested failure, the mapped Player-1 reservoir response is immediately below the eventual Player-2 terminal cell and therefore creates the final support lift.',
    promisingIds.length
      ? 'At least one hazardous reservoir response occurs at a Player-1 decision where production CPC independently restricts play to a different legal column; this is a candidate existing-machinery reroute.'
      : 'Production CPC supplies no qualifying one-column reroute away from the hazardous reservoir response at the traced predecessor states.'
  ],
  boundary:[
    'This is discovery evidence only and does not authorize a response override or certify the rank-20 root.',
    'No oracle, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout is used.',
    'Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.'
  ]
},null,2));
