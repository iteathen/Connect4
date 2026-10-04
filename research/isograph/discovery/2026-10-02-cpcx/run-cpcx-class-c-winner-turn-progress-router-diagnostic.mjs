import {execFileSync} from 'node:child_process';
import {
  createCpcxGeometry,
  scanCpcxObligations,
  cpcxCell,
} from './cpcx.mjs';
import {
  applyCpcxForcedEvent,
  classifyCpcxImmediate,
} from './cpcx-closure.mjs';
import {
  classifyCpcxProgress,
} from './cpcx-progress.mjs';
import {
  composeCpcxForcingMacro,
  composeCpcxForcedNormalization,
  composeCpcxDisjunctiveBlockObligation,
  classifyCpcxSuccessor,
} from './cpcx-successor.mjs';
import {
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';

const endpointScript=new URL(
  './run-cpcx-move6-opponent-descent-endpoint-descriptors.mjs',
  import.meta.url
);
const endpoint=JSON.parse(execFileSync(process.execPath,[endpointScript.pathname],{
  encoding:'utf8',
  maxBuffer:768*1024*1024,
}));

const g=createCpcxGeometry(),
  c2=1*g.columns+2,
  c1=2,
  c3=2*g.columns+2;

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function positionFromKey(key){
  const [moverText,targetText,heightsText,ownerText]=key.split('|');
  const heights=new Uint32Array(heightsText.split(',').map(Number)),
    owner=new Int8Array(ownerText.split(',').map(Number)),
    rank=Array.from(heights).reduce((a,b)=>a+b,0);
  return {
    geometry:g,
    moves:new Uint32Array(0),
    rank,
    mover:Number(moverText),
    heights,
    owner,
    terminal:null,
    targetCell:Number(targetText),
  };
}
function stateKey(position,targetCell=c3){
  return [
    position.mover,
    targetCell,
    Array.from(position.heights).join(','),
    Array.from(position.owner).join(','),
  ].join('|');
}
function c2Singleton(position){
  return scanCpcxObligations(position).find(o=>
    o.player===1&&o.missingCount===1&&o.missingCells[0]===c2
  )??null;
}
function countBy(rows,fn){
  const out={};
  for(const row of rows){
    const k=fn(row)??'NULL';
    out[k]=(out[k]??0)+1;
  }
  return out;
}
function progressTag(progress){
  if(!progress)return 'NULL';
  if(progress.kind==='CERTIFIED_FIRST_WIN')
    return `CERTIFIED_FIRST_WIN:${progress.source??'UNKNOWN'}:P${progress.player}`;
  if(progress.kind==='CERTIFIED_FORCING_MACRO')
    return `CERTIFIED_FORCING_MACRO:${progress.macro?.kind??'UNKNOWN'}`;
  if(progress.kind==='DISJUNCTIVE_BLOCK_OBLIGATION')
    return 'DISJUNCTIVE_BLOCK_OBLIGATION';
  if(progress.kind==='FORCED_NORMALIZATION')
    return 'FORCED_NORMALIZATION';
  return `${progress.kind}:${progress.seam??progress.reason??''}`;
}
function compactProgress(progress){
  return {
    kind:progress?.kind??null,
    exact:progress?.exact??false,
    player:progress?.player??null,
    source:progress?.source??null,
    seam:progress?.seam??null,
    macroKind:progress?.macro?.kind??null,
    primaryCell:Number.isInteger(progress?.macro?.primaryCell)
      ?label(progress.macro.primaryCell):null,
    obligatedPlayer:progress?.obligatedPlayer??null,
  };
}
function advanceExistingRouter(position,{maxSteps=g.cellCount-position.rank}={}){
  let current={
    kind:'CONCRETE_SUCCESSOR',
    exact:true,
    concretePosition:position,
    attacker:0,
  },consumed=0;
  const trace=[];

  while(consumed<=maxSteps){
    const concrete=current.concretePosition??null,
      progress=concrete
        ?classifyCpcxProgress(concrete,{player:0})
        :classifyCpcxSuccessor(current,{attacker:0});
    trace.push({
      rank:concrete?.rank??current.rank?.options??null,
      mover:concrete?.mover??current.nextMover??null,
      tag:progressTag(progress),
      progress:compactProgress(progress),
    });

    if(progress.kind==='CERTIFIED_FIRST_WIN')return {
      status:progress.player===0?'P0_FIRST_WIN':'P1_FIRST_WIN',
      exact:true,
      player:progress.player,
      current,
      concrete,
      progress,
      trace,
      consumed,
    };

    if(!progress.exact)return {
      status:'OPEN_SEAM',
      exact:false,
      current,
      concrete,
      progress,
      trace,
      consumed,
    };

    if(progress.kind==='FORCED_NORMALIZATION'){
      if(!concrete)throw new Error('abstract forced normalization');
      current=composeCpcxForcedNormalization(concrete,progress);
      consumed+=1;
      continue;
    }

    if(progress.kind==='CERTIFIED_FORCING_MACRO'){
      if(!concrete)throw new Error('abstract forcing macro');
      current=composeCpcxForcingMacro(concrete,progress);
      if(!current?.exact)return {
        status:'OPEN_SEAM',
        exact:false,
        current,
        concrete:null,
        progress:current,
        trace,
        consumed,
      };
      const delta=Math.min(...(current.rank?.deltaOptions??[0]));
      if(!(delta>0))throw new Error('forcing macro did not progress');
      consumed+=delta;
      continue;
    }

    if(progress.kind==='DISJUNCTIVE_BLOCK_OBLIGATION'){
      if(!concrete)throw new Error('abstract disjunctive source');
      current=composeCpcxDisjunctiveBlockObligation(concrete,progress);
      if(!current?.exact)return {
        status:'OPEN_SEAM',
        exact:false,
        current,
        concrete:null,
        progress:current,
        trace,
        consumed,
      };
      consumed+=1;
      continue;
    }

    return {
      status:'OPEN_SEAM',
      exact:false,
      current,
      concrete,
      progress,
      trace,
      consumed,
    };
  }

  return {
    status:'STEP_BOUND_EXHAUSTED',
    exact:false,
    current,
    concrete:current.concretePosition??null,
    progress:null,
    trace,
    consumed,
  };
}

const candidates=[];
for(const probe of endpoint.novelMaskSecondLayerProbes??[]){
  if(JSON.stringify(probe.sourceMeasure)!==JSON.stringify([3,9,27]))continue;
  for(const row of probe.secondLayerRows??[]){
    const nt=row.noTransferTargetBlockProbe,
      audit=nt?.exactProgressFirst?.postSuccessorActionAudit;
    if(!Array.isArray(audit))continue;
    for(const action of audit){
      if(!['D6','G4'].includes(action.actionCell))continue;
      for(const target of action.targetRcics??[]){
        if(target.targetCell!=='C3'||target.gapCapacity?.rootGap!==2)continue;
        candidates.push({
          source:{
            firstLayerEventCell:probe.firstLayerEventCell??null,
            secondLayerEventCell:row.eventCell??null,
            blockedCell:nt.blockedCell??null,
            sourceMeasure:probe.sourceMeasure,
            endpointMeasure:probe.endpointMeasure,
          },
          actionCell:action.actionCell,
          gapCapacity:target.gapCapacity,
        });
      }
    }
  }
}

const reports=[];
for(const candidate of candidates){
  const nodes=(candidate.gapCapacity.unresolvedNodes??[]).filter(n=>n.key),
    nodeByKey=new Map(nodes.map(n=>[n.key,n])),
    rows=[];

  for(const node of nodes.filter(n=>n.gap===1)){
    const source=positionFromKey(node.key),
      residual=c2Singleton(source);
    if(!residual||residual.events[0]?.supportDistance!==1)continue;

    for(const p1Cell of frontier(source)){
      if(p1Cell===c1)continue;
      const afterP1=applyCpcxForcedEvent(source,p1Cell);
      if(afterP1.terminal)continue;

      const live=c2Singleton(afterP1),
        reservationActions=[];
      if(live&&live.events[0]?.supportDistance===1){
        for(const p0Cell of frontier(afterP1)){
          const cert=certifyCpcxSupportReleaseResponseNeutralization(afterP1,{
            opponentResidual:live,
            defenderActionCell:p0Cell,
          });
          if(cert.exact&&cert.kind==='SUPPORT_RELEASE_RESPONSE_EDGE')
            reservationActions.push(p0Cell);
        }
      }
      if(reservationActions.length)continue;

      const immediate=classifyCpcxImmediate(afterP1);
      if(immediate.kind!=='NO_IMMEDIATE_OBLIGATION')continue;

      const firstProgress=classifyCpcxProgress(afterP1,{player:0}),
        closure=advanceExistingRouter(afterP1),
        finalConcrete=closure.concrete??closure.current?.concretePosition??null,
        finalKey=finalConcrete&&!finalConcrete.terminal
          ?stateKey(finalConcrete,c3):null,
        match=finalKey?nodeByKey.get(finalKey)??null:null;

      rows.push({
        sourceKey:node.key,
        sourceRank:node.rank,
        sourceSupport:node.support,
        sourceDescriptor:node.descriptor,
        p1EventCell:p1Cell,
        p1EventLabel:label(p1Cell),
        controllerRank:afterP1.rank,
        firstProgress:compactProgress(firstProgress),
        closure:{
          status:closure.status,
          player:closure.player??null,
          consumed:closure.consumed,
          traceSignature:closure.trace.map(x=>x.tag),
          finalProgress:compactProgress(closure.progress),
          finalConcrete:Boolean(finalConcrete),
          finalRank:finalConcrete?.rank??null,
          finalMover:finalConcrete?.mover??null,
          finalTerminal:finalConcrete?.terminal??null,
          exactKnownNodeReentry:Boolean(match),
          matchedNode:match?{
            rank:match.rank,
            gap:match.gap,
            descriptor:match.descriptor,
          }:null,
          abstractKind:!finalConcrete?closure.current?.kind??null:null,
          abstractSource:!finalConcrete?closure.current?.source?.kind??null:null,
        },
      });
    }
  }

  reports.push({
    source:candidate.source,
    actionCell:candidate.actionCell,
    retainedStateCount:rows.length,
    firstProgressKinds:countBy(rows,x=>x.firstProgress.kind),
    firstProgressDetails:countBy(rows,x=>
      x.firstProgress.macroKind??
      x.firstProgress.source??
      x.firstProgress.seam??
      x.firstProgress.kind
    ),
    closureStatusHistogram:countBy(rows,x=>x.closure.status),
    traceSignatureHistogram:countBy(rows,x=>x.closure.traceSignature.join(' -> ')),
    finalSeamHistogram:countBy(rows,x=>
      x.closure.finalProgress?.seam??
      x.closure.finalProgress?.kind??
      x.closure.abstractKind
    ),
    p0FirstWinCount:rows.filter(x=>x.closure.status==='P0_FIRST_WIN').length,
    p1FirstWinCount:rows.filter(x=>x.closure.status==='P1_FIRST_WIN').length,
    finalConcreteCount:rows.filter(x=>x.closure.finalConcrete).length,
    finalAbstractCount:rows.filter(x=>!x.closure.finalConcrete).length,
    exactKnownNodeReentryCount:rows.filter(x=>
      x.closure.exactKnownNodeReentry
    ).length,
    rows,
  });
}

const all=reports.flatMap(x=>x.rows);
console.log(JSON.stringify({
  schema:'connect4.cpcx.class-c-winner-turn-progress-router-diagnostic.v0_1',
  root:'44444',
  reports,
  summary:{
    retainedStateCount:all.length,
    firstProgressKinds:countBy(all,x=>x.firstProgress.kind),
    closureStatusHistogram:countBy(all,x=>x.closure.status),
    p0FirstWinCount:all.filter(x=>x.closure.status==='P0_FIRST_WIN').length,
    p1FirstWinCount:all.filter(x=>x.closure.status==='P1_FIRST_WIN').length,
    finalConcreteCount:all.filter(x=>x.closure.finalConcrete).length,
    finalAbstractCount:all.filter(x=>!x.closure.finalConcrete).length,
    exactKnownNodeReentryCount:all.filter(x=>
      x.closure.exactKnownNodeReentry
    ).length,
    traceSignatureHistogram:countBy(all,x=>x.closure.traceSignature.join(' -> ')),
  },
  boundary:{
    existingProgressRouterOnly:true,
    noPhysicalP0EnumerationAfterCohortSelection:true,
    noLaterFreeP1Frontier:true,
    noRecursiveLegalMoveTraversal:true,
    solvedData:false,
    oracle:false,
    minimax:false,
    remoteness:false,
  },
},null,2));
