import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
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
import {lowerBoundCpcxEarliestTerminal} from './cpcx-deadline.mjs';
import {
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g}),
  canonicalPair=[15,23]; // B3,C4 from qualified CHECKPOINT_0_8.

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}

function reflectCell(cell){
  const {column,row}=cpcxCell(g,cell);
  return row*g.columns+(g.columns-1-column);
}

function canonCell(cell,reflect){
  return reflect?reflectCell(cell):cell;
}

function physicalPair(reflect){
  return canonicalPair.map(cell=>reflect?reflectCell(cell):cell);
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
  return {
    geometry:position.geometry,
    moves:appendMoves(position,events),
    rank:position.rank+events.length,
    mover:(position.mover+events.length)&1,
    heights:v.finalHeights,
    owner:v.finalOwner,
    terminal:v.terminal?{
      player:v.terminal.player,
      lineId:v.terminal.lineId,
    }:null,
  };
}

function currentFrontierCell(position,column){
  const row=position.heights[column];
  return row<g.rows?row*g.columns+column:null;
}

function pairAdvance(position,reflect){
  const pair=physicalPair(reflect),
    rows=pair.map(cell=>{
      const {column,row}=cpcxCell(g,cell),
        distance=row-position.heights[column],
        frontier=currentFrontierCell(position,column);
      return {
        targetCell:cell,
        canonicalTarget:canonCell(cell,reflect),
        column,
        distance,
        frontierCell:frontier,
        canonicalFrontier:frontier===null?null:canonCell(frontier,reflect),
      };
    }).filter(x=>x.distance>=0&&x.frontierCell!==null)
      .sort((a,b)=>
        a.distance-b.distance||
        a.canonicalTarget-b.canonicalTarget
      );
  return rows[0]??null;
}

function selectVertical(position,attacker){
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
  return rows.find(x=>
    x.certificate.exact&&[
      'PREEMPT_OR_FORCED_UPPER',
      'FORCED_UPPER_RESPONSE',
      'ATTACKER_TERMINAL_ON_LOWER',
      'PREEXISTING_CURRENT_TERMINAL',
    ].includes(x.certificate.kind)
  )??null;
}

function depthOneOpponentSingletons(position,opponent=1){
  return scanCpcxObligations(position)
    .filter(o=>
      o.player===opponent&&
      o.missingCount===1&&
      o.events[0].supportDistance===1
    )
    .map(o=>({
      obligation:o,
      targetCell:o.missingCells[0],
      supportCell:o.missingCells[0]-g.columns,
    }))
    .sort((a,b)=>a.targetCell-b.targetCell);
}

function resolutionPositions(position,row,attacker){
  const {demand,certificate}=row,
    defender=attacker^1,
    lower=demand.lowerCell,
    upper=demand.upperCell,
    out=[];

  function add(kind,events,externalCell=null){
    const p=materialize(position,events);
    if(p&&!p.terminal)out.push({kind,events,externalCell,position:p});
  }

  if(certificate.kind==='PREEMPT_OR_FORCED_UPPER'){
    add('PREEMPT',[{cell:lower,owner:defender}]);
    for(const externalCell of certificate.nonpreemptFrontier)
      add('DELAYED',[
        {cell:externalCell,owner:defender},
        {cell:lower,owner:attacker},
        {cell:upper,owner:defender},
      ],externalCell);
  }else if(certificate.kind==='FORCED_UPPER_RESPONSE'){
    add('FORCED_UPPER',[
      {cell:lower,owner:attacker},
      {cell:upper,owner:defender},
    ]);
  }

  return out;
}

const rows=[];

for(let sixthColumn=0;sixthColumn<g.columns;sixthColumn++){
  const sixthCell=root.heights[sixthColumn]*g.columns+sixthColumn,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell:sixthCell,
      actionOwner:1,
      attacker:0,
    }),
    wingMean=wing.survivingFamily.columns.reduce((a,b)=>a+b,0)/
      wing.survivingFamily.columns.length,
    reflect=wingMean>(g.columns-1)/2,
    repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex:0});

  for(const deviationCell of repair.deviationFrontier){
    const postRepair=materialize(root,[
      ...repair.prefix,
      {cell:deviationCell,owner:repair.defender},
      {cell:repair.requiredResponseCell,owner:repair.attacker},
    ]);
    if(!postRepair||postRepair.terminal)continue;

    const normalized=closeCpcxForcedResponses(postRepair);
    if(normalized.kind!=='OPEN')continue;

    const selected=selectVertical(normalized.position,repair.attacker);
    if(!selected)continue;

    for(const resolution of resolutionPositions(
      normalized.position,selected,repair.attacker
    )){
      const p=resolution.position;
      if(p.mover!==0)continue;

      const lower=lowerBoundCpcxEarliestTerminal(p,{player:1}),
        hazards=depthOneOpponentSingletons(p,1),
        advance=pairAdvance(p,reflect),
        hazardRows=[];

      for(const h of hazards){
        let certificate=null;
        if(advance?.frontierCell!==null){
          certificate=certifyCpcxSupportReleaseResponseNeutralization(p,{
            opponentResidual:h.obligation,
            defenderActionCell:advance.frontierCell,
          });
        }
        hazardRows.push({
          lineId:h.obligation.lineId,
          lineLabel:h.obligation.lineLabel,
          canonicalTarget:label(canonCell(h.targetCell,reflect)),
          canonicalSupport:label(canonCell(h.supportCell,reflect)),
          targetCell:label(h.targetCell),
          supportCell:label(h.supportCell),
          neutralization:certificate?{
            kind:certificate.kind,
            exact:certificate.exact??false,
            seam:certificate.seam??null,
            responseEdge:certificate.responseEdge?{
              triggerCell:label(canonCell(
                certificate.responseEdge.triggerCell,reflect
              )),
              responseCell:label(canonCell(
                certificate.responseEdge.responseCell,reflect
              )),
            }:null,
          }:null,
        });
      }

      rows.push({
        sixthMove:sixthColumn+1,
        reflectToCanonicalWing:reflect,
        deviationCell:label(canonCell(deviationCell,reflect)),
        resolution:resolution.kind,
        externalCell:resolution.externalCell===null
          ?null
          :label(canonCell(resolution.externalCell,reflect)),
        rank:p.rank,
        support:reflect
          ?Array.from(p.heights).reverse()
          :Array.from(p.heights),
        opponentEarliestTerminalLowerBound:lower.lowerBoundPly,
        pairAdvance:advance?{
          canonicalTarget:label(advance.canonicalTarget),
          canonicalFrontier:label(advance.canonicalFrontier),
          supportDistance:advance.distance,
          physicalFrontier:label(advance.frontierCell),
          independentlyCertifiedProgressAction:false,
        }:null,
        depthOneOpponentSingletonCount:hazards.length,
        depthOneOpponentSingletons:hazardRows,
      });
    }
  }
}

const lowerTwo=rows.filter(x=>x.opponentEarliestTerminalLowerBound===2),
  moveSummary={};

for(const row of rows){
  const key=String(row.sixthMove);
  if(!moveSummary[key])moveSummary[key]={
    exactResolutionClassCount:0,
    lowerTwoClassCount:0,
    lowerTwoDepthOneSingletonCount:0,
    lowerTwoAllPairAdvanceCompatible:true,
    lowerTwoNeutralizationFailureSeams:{},
  };
  const s=moveSummary[key];
  s.exactResolutionClassCount++;
  if(row.opponentEarliestTerminalLowerBound!==2)continue;
  s.lowerTwoClassCount++;
  s.lowerTwoDepthOneSingletonCount+=row.depthOneOpponentSingletonCount;
  for(const h of row.depthOneOpponentSingletons){
    const n=h.neutralization;
    if(n?.kind!=='SUPPORT_RELEASE_RESPONSE_EDGE'){
      s.lowerTwoAllPairAdvanceCompatible=false;
      const seam=n?.seam??'NO_PINNED_PAIR_ADVANCE';
      s.lowerTwoNeutralizationFailureSeams[seam]=
        (s.lowerTwoNeutralizationFailureSeams[seam]??0)+1;
    }
  }
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.support-release-hazard-diagnostic.v0_1',
  root:'44444',
  stage:'exact theorem-defined first-deviation / normalization / vertical-resolution classes',
  canonicalProtectedPair:['B3','C4'],
  moveSummary,
  lowerTwoClasses:lowerTwo,
  summary:{
    exactResolutionClassCount:rows.length,
    lowerTwoClassCount:lowerTwo.length,
    lowerTwoMoves:[...new Set(lowerTwo.map(x=>x.sixthMove))].sort((a,b)=>a-b),
    lowerTwoDepthOneSingletonCount:lowerTwo.reduce(
      (n,x)=>n+x.depthOneOpponentSingletonCount,0
    ),
    everyLowerTwoClassExplainedByDepthOneSingleton:
      lowerTwo.every(x=>x.depthOneOpponentSingletonCount>0),
    everyLowerTwoHazardCompatibleWithDeterministicPairAdvance:
      lowerTwo.every(x=>
        x.depthOneOpponentSingletons.every(h=>
          h.neutralization?.kind==='SUPPORT_RELEASE_RESPONSE_EDGE'
        )
      ),
  },
  boundary:{
    diagnosticOnly:true,
    pairAdvanceIsPinnedByQualifiedCommonPair:true,
    pairAdvanceIndependentlyCertifiedAsProgressAction:false,
    neutralizationDoesNotPromotePairAdvance:true,
    noOpponentResidualDeletionAuthorized:true,
    bestSetNotProven:true,
  },
  premises:{
    recursiveSearch:false,
    solvedData:false,
    oracle:false,
    arbitrarySecondFrontierSearch:false,
    resolutionClasses:'existing exact debt-repair normalization and vertical two-stage theorem only',
  },
},null,2));
