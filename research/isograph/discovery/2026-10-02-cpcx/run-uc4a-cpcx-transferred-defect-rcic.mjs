import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {
  findCpcxDirectThreeTriggerWingAttacks,
  verifyCpcxFixedEventScript,
} from './cpcx-wing.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  analyzeCpcxOneDefectTargetReservoir,
} from './cpcx-reservoir.mjs';
import {
  certifyCpcxOneDefectTargetReservoirRcic,
} from './cpcx-one-defect-rcic.mjs';
import {
  certifyCpcxOneDefectAttachmentRcic,
} from './cpcx-one-defect-attachment-rcic.mjs';

const g=createCpcxGeometry(),
  fixtures=[
    {id:'U4',sequence:'4444447677'},
    {id:'U5',sequence:'4444447577'},
    {id:'U12',sequence:'444444767577'},
    {id:'U13',sequence:'444444776566'},
  ];

function cellByLabel(s){
  return (Number(s.slice(1))-1)*g.columns+(s.charCodeAt(0)-65);
}
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
function failureSummary(x){
  if(!x)return null;
  const root=x.rootFailure??null;
  return {
    kind:x.kind,
    exact:x.exact??false,
    seam:x.seam??null,
    player:x.player??null,
    rootGap:x.rootGap??null,
    rootReservoirRank:x.rootReservoirRank??x.rootMeasure??null,
    nodeCount:x.nodeCount??null,
    evaluatedNodes:x.evaluatedNodes??x.evaluatedNodeCount??null,
    edgeCount:x.edgeCount??null,
    measures:x.measures??null,
    rootFailure:root?{
      seam:root.seam??root.kind??null,
      rank:root.rank??null,
      measure:root.measure??null,
      defenderCell:Number.isInteger(root.defenderCell)
        ?label(root.defenderCell):null,
      defenderLabel:root.defenderLabel??null,
      templateCount:root.templateCount??null,
      failures:(root.failures??[]).slice(0,8).map(f=>({
        templateIndex:f.templateIndex??null,
        seam:f.seam??null,
        policyKind:f.policyKind??null,
        optionCount:f.optionCount??null,
        defectCell:Number.isInteger(f.defectCell)?label(f.defectCell):null,
        defectLabel:f.defectLabel??null,
      })),
    }:null,
  };
}

const rows=[];
for(const f of fixtures){
  const source=buildCpcxPosition(f.sequence,{geometry:g}),
    wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
      .find(canonicalWing);
  if(!wing)throw new Error(`wing missing ${f.id}`);
  const t=wing.anchoredLine.triggerCells,
    r=wing.anchoredLine.requiredResponseCells,
    short=materialize(source,[
      {cell:t[0],owner:0},
      {cell:r[0],owner:1},
      {cell:t[1],owner:0},
      {cell:t[2],owner:1},
      {cell:r[1],owner:0},
    ]);
  if(!short||short.mover!==1)throw new Error(`short invalid ${f.id}`);

  let p=applyCpcxForcedEvent(short,cellByLabel('B3'));
  if(p.terminal||p.mover!==0)throw new Error(`B3 invalid ${f.id}`);
  p=applyCpcxForcedEvent(p,cellByLabel('B4'));
  if(p.terminal||p.mover!==1)throw new Error(`B4 invalid ${f.id}`);
  p=applyCpcxForcedEvent(p,cellByLabel('B5'));
  if(p.terminal||p.mover!==0)throw new Error(`B5 invalid ${f.id}`);
  p=applyCpcxForcedEvent(p,cellByLabel('C2'));
  if(p.terminal||p.mover!==1)throw new Error(`C2 invalid ${f.id}`);

  const target=cellByLabel('E4'),
    one=analyzeCpcxOneDefectTargetReservoir(p,{attacker:0,targetCell:target}),
    rcic=certifyCpcxOneDefectTargetReservoirRcic(p,{
      attacker:0,targetCell:target,maxNodes:8192,useCpc2Restriction:true,
    }),
    attachment=certifyCpcxOneDefectAttachmentRcic(p,{
      attacker:0,targetCell:target,maxNodes:8192,useCpc2Restriction:true,
    });

  rows.push({
    id:f.id,
    rank:p.rank,
    mover:p.mover,
    support:Array.from(p.heights),
    oneDefect:{
      kind:one.kind,
      totalRelevantEvents:one.totalRelevantEvents??null,
      minimumUncoveredResiduals:one.minimumUncoveredResiduals??null,
      fullCoverageTemplateCount:one.fullCoverageTemplateCount??null,
    },
    rcic:failureSummary(rcic),
    attachmentRcic:failureSummary(attachment),
  });
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.transferred-defect-rcic.v0_1',
  observation:'apply existing well-founded one-defect proof-class engines to the E4 target created by B5 block diagonal transfer',
  rows,
  summary:{
    rcicCertified:rows.filter(r=>
      r.rcic.kind==='CERTIFIED_FIRST_WIN'&&r.rcic.player===0
    ).map(r=>r.id),
    attachmentRcicCertified:rows.filter(r=>
      r.attachmentRcic.kind==='CERTIFIED_FIRST_WIN'&&
      r.attachmentRcic.player===0
    ).map(r=>r.id),
    rcicSeams:Object.fromEntries(rows.map(r=>[r.id,r.rcic.seam])),
    attachmentRcicSeams:Object.fromEntries(
      rows.map(r=>[r.id,r.attachmentRcic.seam])
    ),
  },
  boundary:{
    diagnosticOnly:true,
    consumedCenterFixtures:true,
    oneDefectRcicUniversalClaimPreviouslyFalsified:true,
    positiveInstanceDoesNotPromoteUniversalRcic:true,
    structuralProofClassOnly:true,
    noSolvedData:true,
    noOracle:true,
    noOrdinaryGameTreeSearch:true,
  },
},null,2));
