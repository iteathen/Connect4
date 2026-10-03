import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {
  applyCpcxForcedEvent,
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
  partitionCpcxVerticalTwoStageGuard,
} from './cpcx-two-stage.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {
  composeCpcxForcingMacro,
  runCpcxFirstWinCertificate,
} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  source=buildCpcxPosition('444444776566',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function cellByLabel(s){
  return (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65);
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)out[position.moves.length+i]=events[i].cell%g.columns;
  return out;
}
function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal||v.terminal)return null;
  return {
    geometry:g,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:null,
  };
}
function canonicalWing(w){
  return w.anchoredLine.triggerCells
    .map(cell=>cpcxCell(g,cell).column)
    .sort((a,b)=>a-b).join(',')==='0,1,2'&&
    cpcxCell(g,w.anchoredLine.anchorCell).column===3;
}
function progressSummary(p){
  return {
    kind:p.kind,
    exact:p.exact??false,
    player:p.player??null,
    source:p.source??null,
    seam:p.seam??p.reason??null,
    macroKind:p.macro?.kind??null,
    primaryCell:Number.isInteger(p.macro?.primaryCell)?label(p.macro.primaryCell):null,
    secondaryCell:Number.isInteger(p.macro?.secondaryCell)?label(p.macro.secondaryCell):null,
  };
}
function forcingProgress(demand,certificate){
  return {
    kind:'CERTIFIED_FORCING_MACRO',
    exact:true,
    player:demand.attacker,
    macro:{
      kind:'VERTICAL_TWO_STAGE',
      primaryCell:demand.lowerCell,
      secondaryCell:demand.upperCell,
      lineId:demand.obligation.lineId,
      demand,
      certificate,
    },
  };
}

const wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
  .find(canonicalWing);
if(!wing)throw new Error('wing missing');
const t=wing.anchoredLine.triggerCells,r=wing.anchoredLine.requiredResponseCells;

let p=materialize(source,[
  {cell:t[0],owner:0},
  {cell:r[0],owner:1},
  {cell:t[1],owner:0},
  {cell:t[2],owner:1},
  {cell:r[1],owner:0},
]);
if(!p)throw new Error('short invalid');
for(const s of ['B3','B4','B5','C2','F4','A3','E2','E3']){
  p=applyCpcxForcedEvent(p,cellByLabel(s));
  if(p.terminal)throw new Error(`${s} terminal`);
}
const firstClose=closeCpcxForcedResponses(p);
if(firstClose.kind!=='OPEN')throw new Error('first close not open');
p=firstClose.position;
if(p.mover!==0)throw new Error('expected P0');
p=applyCpcxForcedEvent(p,cellByLabel('A4'));
if(p.terminal||p.mover!==1)throw new Error('A4 setup invalid');

const demand=findCpcxVerticalTwoStageObligations(p,{player:0})
  .find(d=>label(d.lowerCell)==='A5'&&label(d.upperCell)==='A6');
if(!demand)throw new Error('A5/A6 demand missing');

const failure=certifyCpcxVerticalTwoStage(p,demand);
if(failure.kind!=='POST_LOWER_FIRST_WIN_GUARD_FAILURE')
  throw new Error(`unexpected certificate ${failure.kind}`);

const partition=partitionCpcxVerticalTwoStageGuard(p,demand,failure),
  safeCertificate={
    kind:'PREEMPT_OR_FORCED_UPPER',
    exact:true,
    moverRole:'DEFENDER',
    lowerCell:demand.lowerCell,
    upperCell:demand.upperCell,
    preemptCell:demand.lowerCell,
    nonpreemptFrontier:[...partition.safeNonpreemptFrontier],
    responseCell:demand.upperCell,
    rule:'diagnostic reuse of exact partitioned vertical safe response set',
    choiceEnumeration:false,
    restrictedByExactHazardAudit:true,
  },
  safe=composeCpcxForcingMacro(
    p,
    forcingProgress(demand,safeCertificate)
  );

const hazards=[];
for(const row of partition.guardNormalizationClasses){
  const hazardCell=row.defenderMove,
    after=applyCpcxForcedEvent(p,hazardCell);
  if(after.terminal){
    hazards.push({
      hazardCell:label(hazardCell),
      targetCells:row.targetCells.map(label),
      terminal:after.terminal,
      normalization:null,
      progress:null,
      firstWin:null,
    });
    continue;
  }

  const normalized=closeCpcxForcedResponses(after),
    q=normalized.position,
    progress=normalized.kind==='OPEN'
      ?classifyCpcxProgress(q,{player:0})
      :null,
    cert=normalized.kind==='OPEN'
      ?runCpcxFirstWinCertificate(q,{attacker:0})
      :null;

  hazards.push({
    hazardCell:label(hazardCell),
    targetCells:row.targetCells.map(label),
    normalization:{
      kind:normalized.kind,
      player:normalized.player??null,
      stepCount:normalized.steps?.length??0,
      steps:(normalized.steps??[]).map(s=>({
        cell:label(s.cell),
        player:s.player,
      })),
      boundary:normalized.boundary?.kind??null,
      rank:q.rank,
      mover:q.mover,
      support:Array.from(q.heights),
    },
    progress:progress?progressSummary(progress):null,
    firstWin:cert?{
      kind:cert.kind,
      exact:cert.exact??false,
      player:cert.player??null,
      seam:cert.seam??null,
      traceLength:cert.trace?.length??0,
    }:null,
  });
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.u13.partitioned-vertical-three-stage.v0_1',
  source:{
    rank:p.rank,
    mover:p.mover,
    support:Array.from(p.heights),
    line:demand.obligation.lineLabel,
    lower:label(demand.lowerCell),
    upper:label(demand.upperCell),
  },
  failure:{
    kind:failure.kind,
    exact:failure.exact??false,
    riskCount:failure.risks?.length??0,
  },
  partition:{
    exact:partition.exact,
    preemptCell:label(partition.preemptCell),
    safeNonpreemptFrontier:partition.safeNonpreemptFrontier.map(label),
    hazardCells:partition.guardNormalizationClasses.map(x=>label(x.defenderMove)),
    responseClasses:partition.responseClasses,
  },
  safeClass:{
    kind:safe.kind,
    exact:safe.exact??false,
    seam:safe.seam??null,
    nextMover:safe.nextMover??null,
    rank:safe.rank??null,
    guaranteedResidualCount:safe.guaranteedResiduals?.length??null,
    opponentEarliestTerminalLowerBound:
      safe.firstWinFacts?.opponentEarliestTerminalLowerBound??null,
  },
  hazards,
  summary:{
    safeClassExact:safe.exact===true,
    hazardCount:hazards.length,
    hazardNormalizationKinds:[...new Set(hazards.map(x=>
      x.normalization?.kind??'TERMINAL'
    ))].sort(),
    hazardProgressKinds:[...new Set(hazards.map(x=>
      x.progress?.kind??(x.terminal?'TERMINAL':'NONE')
    ))].sort(),
    certifiedFirstWinHazards:hazards.filter(x=>
      x.firstWin?.kind==='CERTIFIED_FIRST_WIN'&&x.firstWin.player===0
    ).map(x=>x.hazardCell),
  },
  boundary:{
    diagnosticOnly:true,
    consumedU13Fixture:true,
    responseClassesFromExistingPartitionTheoremOnly:true,
    deterministicNormalizationOnly:true,
    noArbitraryReplyTraversal:true,
    noValueConclusion:true,
    solvedData:false,
    oracle:false,
  },
},null,2));
