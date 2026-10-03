import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
  scanCpcxObligations,
} from './cpcx.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {closeCpcxForcedResponses} from './cpcx-closure.mjs';
import {
  certifyCpcxSupportReleaseResponseNeutralization,
} from './cpcx-support-release-neutralization.mjs';

const g=createCpcxGeometry(),
  fixtures=[
    {id:'U4',sequence:'4444447677'},
    {id:'U5',sequence:'4444447577'},
    {id:'U12',sequence:'444444767577'},
    {id:'U13',sequence:'444444776566'},
  ];

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return `${String.fromCharCode(65+column)}${row+1}`;
}
function appendMoves(position,events){
  const out=new Uint32Array(position.moves.length+events.length);
  out.set(position.moves);
  for(let i=0;i<events.length;i++)
    out[position.moves.length+i]=events[i].cell%g.columns;
  return out;
}
function materialize(position,events){
  const v=verifyCpcxFixedEventScript(position,events);
  if(!v.legal)return {exact:false,verification:v};
  return {
    exact:true,
    verification:v,
    position:{
      geometry:g,
      moves:appendMoves(position,events),
      rank:position.rank+events.length,
      mover:(position.mover+events.length)&1,
      heights:v.finalHeights,
      owner:v.finalOwner,
      terminal:v.terminal?{
        player:v.terminal.player,
        lineId:v.terminal.lineId,
      }:null,
    },
  };
}
function canonicalWing(w){
  return w.anchoredLine.triggerCells
    .map(cell=>cpcxCell(g,cell).column).sort((a,b)=>a-b).join(',')==='0,1,2'&&
    cpcxCell(g,w.anchoredLine.anchorCell).column===3;
}
function depthOneSingletons(position,player){
  return scanCpcxObligations(position)
    .filter(o=>
      o.player===player&&
      o.missingCount===1&&
      o.events[0].supportDistance===1
    )
    .map(o=>({
      obligation:o,
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      target:o.missingCells[0],
      support:o.missingCells[0]-g.columns,
    }))
    .sort((a,b)=>a.target-b.target);
}
function horizontalThreeResiduals(position,player=0){
  return scanCpcxObligations(position)
    .filter(o=>
      o.player===player&&
      o.orientation==='H'&&
      o.missingCount===3&&
      o.missingCells.every(cell=>cpcxCell(g,cell).column<=2)
    )
    .map(o=>({
      lineId:o.lineId,
      lineLabel:o.lineLabel,
      missing:o.missingCells.map(label),
      support:o.events.map(e=>e.supportDistance),
      playable:o.currentlyPlayableCells.map(label),
    }))
    .sort((a,b)=>a.lineId-b.lineId);
}
function projection(position){
  return {
    mover:position.mover,
    rank:position.rank,
    heights:[position.heights[0],position.heights[1],position.heights[2]],
    owner:Array.from({length:g.rows},(_,row)=>
      [0,1,2].map(c=>position.owner[row*g.columns+c])
    ),
  };
}

const rows=fixtures.map(f=>{
  const source=buildCpcxPosition(f.sequence,{geometry:g}),
    wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
      .find(canonicalWing);
  if(!wing)throw new Error(`source wing missing ${f.id}`);

  const t=wing.anchoredLine.triggerCells,
    r=wing.anchoredLine.requiredResponseCells,
    theftEvents=[
      {cell:t[0],owner:0,role:'TRIGGER_1'},
      {cell:r[0],owner:1,role:'HONORED_RESPONSE_1'},
      {cell:t[1],owner:0,role:'TRIGGER_2'},
      {cell:t[2],owner:1,role:'FINAL_TRIGGER_THEFT'},
      {cell:r[1],owner:0,role:'DEBT_REPAIR'},
    ],
    after=materialize(source,theftEvents);
  if(!after.exact||after.position.terminal)
    throw new Error(`theft/repair path invalid ${f.id}`);

  const normalized=closeCpcxForcedResponses(after.position),
    open=normalized.kind==='OPEN'?normalized.position:null,
    renewalWings=open&&open.mover===0
      ?findCpcxDirectThreeTriggerWingAttacks(open,{attacker:0})
      :[],
    canonicalRenewals=renewalWings.filter(canonicalWing),
    hazards=open?depthOneSingletons(open,1):[],
    neutralizations=[];

  for(const renewal of canonicalRenewals){
    const progressCell=renewal.anchoredLine.triggerCells[0];
    for(const h of hazards){
      const c=certifyCpcxSupportReleaseResponseNeutralization(open,{
        opponentResidual:h.obligation,
        defenderActionCell:progressCell,
      });
      neutralizations.push({
        renewalLineId:renewal.anchoredLine.lineId,
        progressCell:label(progressCell),
        hazardLineId:h.lineId,
        hazardLineLabel:h.lineLabel,
        target:label(h.target),
        support:label(h.support),
        kind:c.kind,
        exact:c.exact??false,
        seam:c.seam??null,
        responseEdge:c.responseEdge?{
          trigger:label(c.responseEdge.triggerCell),
          response:label(c.responseEdge.responseCell),
        }:null,
      });
    }
  }

  return {
    id:f.id,
    sequence:f.sequence,
    sourceRank:source.rank,
    sourceWing:{
      lineId:wing.anchoredLine.lineId,
      line:wing.anchoredLine.lineCells.map(label),
      triggers:t.map(label),
      responses:r.slice(0,2).map(label),
    },
    theftRepair:{
      events:theftEvents.map(e=>({cell:label(e.cell),owner:e.owner,role:e.role})),
      finalSupport:Array.from(after.position.heights),
      nextMover:after.position.mover,
    },
    normalization:{
      kind:normalized.kind,
      certifiedPlayer:normalized.player??null,
      steps:(normalized.steps??[]).map(s=>({
        cell:label(s.cell),
        owner:s.owner,
      })),
    },
    open:open?{
      projection:projection(open),
      horizontalThreeResiduals:horizontalThreeResiduals(open,0),
      directWingCount:renewalWings.length,
      canonicalDirectWingCount:canonicalRenewals.length,
      canonicalDirectWings:canonicalRenewals.map(w=>({
        lineId:w.anchoredLine.lineId,
        line:w.anchoredLine.lineCells.map(label),
        triggers:w.anchoredLine.triggerCells.map(label),
        responses:w.anchoredLine.requiredResponseCells.slice(0,2).map(label),
      })),
      opponentDepthOneSingletons:hazards.map(h=>({
        lineId:h.lineId,
        lineLabel:h.lineLabel,
        target:label(h.target),
        support:label(h.support),
      })),
      neutralizations,
    }:null,
  };
});

function key(value){return JSON.stringify(value);}
const openRows=rows.filter(r=>r.open);

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.final-trigger-theft-renewal.v0_1',
  observation:'exact final-trigger theft + debt repair + deterministic normalization, then direct-wing renewal',
  rows,
  summary:{
    allTheftRepairPathsExact:rows.every(r=>r.theftRepair),
    allNormalizeOpen:rows.every(r=>r.normalization.kind==='OPEN'),
    allOpenMoverP0:openRows.length===rows.length&&
      openRows.every(r=>r.open.projection.mover===0),
    allHaveCanonicalDirectRenewal:openRows.length===rows.length&&
      openRows.every(r=>r.open.canonicalDirectWingCount>0),
    projectionClassCount:new Set(openRows.map(r=>key(r.open.projection))).size,
    horizontalThreeResidualClassCount:new Set(
      openRows.map(r=>key(r.open.horizontalThreeResiduals))
    ).size,
    depthOneHazardClassCount:new Set(
      openRows.map(r=>key(r.open.opponentDepthOneSingletons))
    ).size,
    allHazardsNeutralizedByRenewalFirstTrigger:
      openRows.every(r=>r.open.neutralizations.every(n=>
        n.kind==='SUPPORT_RELEASE_RESPONSE_EDGE'
      )),
    neutralizationAttemptCount:openRows.reduce(
      (n,r)=>n+r.open.neutralizations.length,0
    ),
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    directRenewalTheoremQualified:true,
    supportReleaseNeutralizationQualified:true,
    noRecursiveReplyTraversal:true,
    noSolvedData:true,
    noOracle:true,
    noValueConclusion:true,
  },
},null,2));
