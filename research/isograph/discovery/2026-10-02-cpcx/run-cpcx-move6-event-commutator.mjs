import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  closeCpcxForcedResponses,
} from './cpcx-closure.mjs';
import {
  findCpcxVerticalTwoStageObligations,
  certifyCpcxVerticalTwoStage,
} from './cpcx-two-stage.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {certifyCpcxGuardedExternalEventCommutator} from './cpcx-commutator.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function reflectCell(cell){
  const {column,row}=cpcxCell(g,cell);
  return row*g.columns+(g.columns-1-column);
}

function reflectEvent(event){
  return {cell:reflectCell(event.cell),owner:event.owner};
}

function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%position.geometry.columns;
  return out;
}

function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal)return null;
  const rank=position.rank+events.length;
  return {
    geometry:position.geometry,
    moves:appendMoves(position,events),
    rank,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:v.terminal?{
      player:v.terminal.player,
      lineId:v.terminal.lineId,
    }:null,
  };
}

function verticalRows(position,attacker){
  const rows=[];
  for(const demand of findCpcxVerticalTwoStageObligations(position,{player:attacker})){
    const certificate=certifyCpcxVerticalTwoStage(position,demand);
    rows.push({demand,certificate});
  }
  rows.sort((a,b)=>
    a.demand.lowerCell-b.demand.lowerCell||
    a.demand.upperCell-b.demand.upperCell||
    a.demand.obligation.lineId-b.demand.obligation.lineId
  );
  return rows;
}

function selectVertical(position,attacker){
  return verticalRows(position,attacker).find(x=>
    x.certificate.exact&&[
      'PREEMPT_OR_FORCED_UPPER',
      'FORCED_UPPER_RESPONSE',
      'ATTACKER_TERMINAL_ON_LOWER',
      'PREEXISTING_CURRENT_TERMINAL',
    ].includes(x.certificate.kind)
  )??null;
}

function physicalKey(position,reflect=false){
  const heights=reflect
    ?Array.from(position.heights).reverse()
    :Array.from(position.heights);
  const owner=[];
  for(let row=0;row<g.rows;row++)for(let column=0;column<g.columns;column++){
    const sourceColumn=reflect?g.columns-1-column:column;
    owner.push(position.owner[row*g.columns+sourceColumn]+1);
  }
  return `${position.mover}|${heights.join(',')}|${owner.join('')}`;
}

function canonicalPhysical(position){
  const direct=physicalKey(position,false),
    reflected=physicalKey(position,true);
  return reflected<direct
    ?{key:reflected,reflect:true}
    :{key:direct,reflect:false};
}

function eventEqual(a,b){
  return a?.cell===b?.cell&&a?.owner===b?.owner;
}

function eventListEqual(a,b){
  return a.length===b.length&&a.every((e,i)=>eventEqual(e,b[i]));
}

function exactDirectPositionEqual(a,b){
  return a.rank===b.rank&&a.mover===b.mover&&
    Array.from(a.heights).every((x,i)=>x===b.heights[i])&&
    Array.from(a.owner).every((x,i)=>x===b.owner[i])&&
    JSON.stringify(a.terminal)===JSON.stringify(b.terminal);
}

function canonicalizeTrace(events,reflect){
  return reflect?events.map(reflectEvent):events.map(e=>({cell:e.cell,owner:e.owner}));
}

function addState(groups,position,source,traceEvents){
  if(!position||position.terminal)return;
  const progress=classifyCpcxProgress(position,{player:0});
  if(!['NO_CERTIFICATE','PROJECTION_ONLY'].includes(progress.kind))return;

  const canonical=canonicalPhysical(position);
  if(!groups.has(canonical.key))groups.set(canonical.key,{
    key:canonical.key,
    rank:position.rank,
    mover:position.mover,
    support:canonical.reflect
      ?Array.from(position.heights).reverse()
      :Array.from(position.heights),
    sources:[],
  });

  groups.get(canonical.key).sources.push({
    ...source,
    reflectedToCanonical:canonical.reflect,
    traceEvents:canonicalizeTrace(traceEvents,canonical.reflect),
  });
}

function resolutionStates(position,row,attacker,sourceBase,baseEvents,groups){
  const {demand,certificate}=row,
    defender=attacker^1,
    lower=demand.lowerCell,
    upper=demand.upperCell;

  function add(resolution,events,extra={}){
    const trace=[...baseEvents,...events],
      out=materialize(root,trace);
    if(out)addState(groups,out,{...sourceBase,resolution,...extra},trace);
  }

  if(certificate.kind==='PREEMPT_OR_FORCED_UPPER'){
    add('PREEMPT',[{cell:lower,owner:defender}]);
    for(const externalCell of certificate.nonpreemptFrontier)
      add('DELAYED',[
        {cell:externalCell,owner:defender},
        {cell:lower,owner:attacker},
        {cell:upper,owner:defender},
      ],{externalCell:label(externalCell)});
  }else if(certificate.kind==='FORCED_UPPER_RESPONSE'){
    add('FORCED_UPPER',[
      {cell:lower,owner:attacker},
      {cell:upper,owner:defender},
    ]);
  }
}

function extractTransposition(a,b){
  const A=a.traceEvents,B=b.traceEvents;
  if(A.length!==B.length||A.length<3)return null;

  let prefix=0;
  while(prefix<A.length&&eventEqual(A[prefix],B[prefix]))prefix++;

  let suffix=0;
  while(
    suffix<A.length-prefix&&
    eventEqual(A[A.length-1-suffix],B[B.length-1-suffix])
  )suffix++;

  const end=A.length-suffix,
    middleA=A.slice(prefix,end),
    middleB=B.slice(prefix,end);

  if(middleA.length<3||middleA.length!==middleB.length)return null;
  if(!eventEqual(middleA[0],middleB[middleB.length-1]))return null;
  if(!eventEqual(middleA[middleA.length-1],middleB[0]))return null;

  const bridgeA=middleA.slice(1,-1),
    bridgeB=middleB.slice(1,-1);
  if(!bridgeA.length||!eventListEqual(bridgeA,bridgeB))return null;

  const x=middleA[0],y=middleA[middleA.length-1];
  if(eventEqual(x,y))return null;

  return {
    prefixEvents:A.slice(0,prefix),
    x,
    y,
    bridgeEvents:bridgeA,
    suffixEvents:A.slice(end),
    middleLength:middleA.length,
  };
}

function supportPrerequisitesAtSource(position,events){
  const cells=[];
  for(const event of events){
    const {column,row}=cpcxCell(g,event.cell),
      height=position.heights[column];
    for(let r=height;r<row;r++)cells.push(r*g.columns+column);
  }
  return [...new Set(cells)].sort((a,b)=>a-b);
}

function sourceSummary(source){
  return {
    sixthMove:source.sixthMove,
    decisionIndex:source.decisionIndex,
    deviationCell:source.deviationCell,
    resolution:source.resolution,
    externalCell:source.externalCell??null,
    verticalKind:source.verticalKind??null,
    lowerCell:source.lowerCell??null,
    upperCell:source.upperCell??null,
    reflectedToCanonical:source.reflectedToCanonical,
  };
}

const groups=new Map();

for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,
      actionOwner:1,
      attacker:0,
    });

  for(let decisionIndex=0;decisionIndex<=1;decisionIndex++){
    const repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex});

    for(const deviationCell of repair.deviationFrontier){
      const preNormalization=[
          ...repair.prefix,
          {cell:deviationCell,owner:repair.defender},
          {cell:repair.requiredResponseCell,owner:repair.attacker},
        ],
        postRepair=materialize(root,preNormalization);

      if(!postRepair||postRepair.terminal)continue;

      const normalized=closeCpcxForcedResponses(postRepair);
      if(normalized.kind!=='OPEN')continue;

      const normalizedEvents=normalized.steps.map(step=>({
          cell:step.cell,
          owner:step.player,
        })),
        baseEvents=[...preNormalization,...normalizedEvents],
        selected=selectVertical(normalized.position,repair.attacker),
        sourceBase={
          sixthMove:column+1,
          decisionIndex,
          deviationCell:label(deviationCell),
        };

      if(!selected){
        addState(groups,normalized.position,{
          ...sourceBase,
          resolution:'NO_EXACT_VERTICAL',
        },baseEvents);
        continue;
      }

      resolutionStates(
        normalized.position,
        selected,
        repair.attacker,
        {
          ...sourceBase,
          verticalKind:selected.certificate.kind,
          lowerCell:label(selected.demand.lowerCell),
          upperCell:label(selected.demand.upperCell),
        },
        baseEvents,
        groups,
      );
    }
  }
}

const classes=[...groups.values()]
  .sort((a,b)=>a.rank-b.rank||a.key.localeCompare(b.key))
  .map((row,index)=>({...row,classId:`U${index+1}`}));

const candidatePairs=[],seamCounts=new Map();

for(const cls of classes){
  for(let i=0;i<cls.sources.length;i++)for(let j=i+1;j<cls.sources.length;j++){
    const a=cls.sources[i],b=cls.sources[j],
      t=extractTransposition(a,b);
    if(!t)continue;

    const source=materialize(root,t.prefixEvents);
    if(!source||source.terminal)continue;

    const supportPrerequisiteCells=supportPrerequisitesAtSource(
        source,t.bridgeEvents
      ),
      macro={
        kind:'RECONSTRUCTED_THEOREM_DEFINED_BRIDGE',
        exact:true,
        events:t.bridgeEvents,
        loadBearingCells:[
          ...new Set([
            ...t.bridgeEvents.map(e=>e.cell),
            ...supportPrerequisiteCells,
          ]),
        ].sort((x,y)=>x-y),
        supportPrerequisiteCells,
        premiseResiduals:[],
      },
      certificate=certifyCpcxGuardedExternalEventCommutator(source,{
        x:t.x,
        y:t.y,
        macro,
      }),
      finalA=materialize(root,a.traceEvents),
      finalB=materialize(root,b.traceEvents),
      exactFinalEquality=Boolean(
        finalA&&finalB&&exactDirectPositionEqual(finalA,finalB)
      ),
      row={
        classId:cls.classId,
        sourceA:sourceSummary(a),
        sourceB:sourceSummary(b),
        prefixLength:t.prefixEvents.length,
        suffixLength:t.suffixEvents.length,
        x:{cell:label(t.x.cell),owner:t.x.owner},
        y:{cell:label(t.y.cell),owner:t.y.owner},
        bridge:t.bridgeEvents.map(e=>({cell:label(e.cell),owner:e.owner})),
        suffix:t.suffixEvents.map(e=>({cell:label(e.cell),owner:e.owner})),
        certificateKind:certificate.kind,
        seam:certificate.seam??null,
        exact:certificate.exact===true,
        exactFinalEquality,
      };

    candidatePairs.push(row);
    if(!row.exact){
      const seam=row.seam??'UNKNOWN';
      seamCounts.set(seam,(seamCounts.get(seam)??0)+1);
    }
  }
}

const certifiedPairs=candidatePairs.filter(x=>x.exact&&x.exactFinalEquality),
  classIds=[...new Set(certifiedPairs.map(x=>x.classId))].sort((a,b)=>
    Number(a.slice(1))-Number(b.slice(1))
  ),
  sourceSignatures=new Set();

for(const row of certifiedPairs){
  sourceSignatures.add(JSON.stringify(row.sourceA));
  sourceSignatures.add(JSON.stringify(row.sourceB));
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.guarded-event-commutator-diagnostic.v0_1',
  root:'44444',
  unresolvedPhysicalClassCount:classes.length,
  candidateTranspositionPairCount:candidatePairs.length,
  certifiedTranspositionPairCount:certifiedPairs.length,
  certifiedClassCount:classIds.length,
  certifiedClassIds:classIds,
  certifiedSourceOccurrenceCount:sourceSignatures.size,
  seamCounts:Object.fromEntries(
    [...seamCounts.entries()].sort((a,b)=>a[0].localeCompare(b[0]))
  ),
  pairs:candidatePairs,
  theoremBoundary:{
    runtimeUsesClassIds:false,
    classIdsAreDiagnosticLabelsOnly:true,
    exactPhysicalClassCountReduced:false,
    explanation:'the existing unresolved artifact already quotients exact physical endpoints; the commutator removes duplicated event-order provenance and supplies a structural reason for reconvergence, not a new equality between distinct physical endpoints',
  },
  premises:{
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    futureTreeGeneration:false,
    sourcePairing:'only theorem-defined unresolved source traces already produced by debt/forced-normalization/vertical macros',
    commutatorRuntimeCondition:'cell/support/load-bearing/cofactor/first-terminal guards only',
  },
},null,2));
