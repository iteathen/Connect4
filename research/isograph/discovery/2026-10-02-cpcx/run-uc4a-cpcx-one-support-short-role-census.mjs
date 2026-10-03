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
import {classifyCpcxProgress} from './cpcx-progress.mjs';
import {
  composeCpcxForcingMacro,
  composeCpcxForcedNormalization,
  composeCpcxDisjunctiveBlockObligation,
} from './cpcx-successor.mjs';

const g=createCpcxGeometry(),
  fixtures=[
    {id:'U4',sequence:'4444447677'},
    {id:'U5',sequence:'4444447577'},
    {id:'U12',sequence:'444444767577'},
    {id:'U13',sequence:'444444776566'},
  ],
  A3=2*g.columns+0,
  B3=2*g.columns+1,
  C2=1*g.columns+2;

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
    .map(cell=>cpcxCell(g,cell).column).sort((a,b)=>a-b).join(',')==='0,1,2'&&
    cpcxCell(g,w.anchoredLine.anchorCell).column===3;
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=position.heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}
function role(cell){
  if(cell===A3)return 'BLOCK_A3';
  if(cell===B3)return 'BLOCK_B3';
  if(cell===C2)return 'SUPPLY_C2';
  return 'EXTERNAL';
}
function progressSummary(progress){
  return {
    kind:progress.kind,
    exact:progress.exact??false,
    player:progress.player??null,
    source:progress.source??null,
    seam:progress.seam??progress.reason??null,
    macroKind:progress.macro?.kind??null,
    primaryCell:Number.isInteger(progress.macro?.primaryCell)
      ?label(progress.macro.primaryCell):null,
    secondaryCell:Number.isInteger(progress.macro?.secondaryCell)
      ?label(progress.macro.secondaryCell):null,
    blockerCells:(progress.obligation?.blockingCells??[]).map(label),
  };
}
function oneStep(position,progress){
  let s=null;
  if(progress.kind==='FORCED_NORMALIZATION')
    s=composeCpcxForcedNormalization(position,progress);
  else if(progress.kind==='CERTIFIED_FORCING_MACRO')
    s=composeCpcxForcingMacro(position,progress);
  else if(progress.kind==='DISJUNCTIVE_BLOCK_OBLIGATION')
    s=composeCpcxDisjunctiveBlockObligation(position,progress);
  if(!s)return null;
  return {
    kind:s.kind,
    exact:s.exact??false,
    player:s.player??null,
    nextMover:s.nextMover??s.concretePosition?.mover??null,
    rank:s.rank??null,
    sourceKind:s.source?.kind??null,
    certificateKind:s.source?.certificateKind??null,
    guaranteedResidualCount:s.guaranteedResiduals?.length??null,
    blockerTokenCount:s.blockerTokens?.length??0,
  };
}

const rows=[];
for(const f of fixtures){
  const source=buildCpcxPosition(f.sequence,{geometry:g}),
    wing=findCpcxDirectThreeTriggerWingAttacks(source,{attacker:0})
      .find(canonicalWing);
  if(!wing)throw new Error(`source wing missing ${f.id}`);
  const t=wing.anchoredLine.triggerCells,
    r=wing.anchoredLine.requiredResponseCells,
    base=materialize(source,[
      {cell:t[0],owner:0},
      {cell:r[0],owner:1},
      {cell:t[1],owner:0},
      {cell:t[2],owner:1},
      {cell:r[1],owner:0},
    ]);
  if(!base||base.mover!==1)throw new Error(`bad base ${f.id}`);

  for(const cell of frontier(base)){
    const child=applyCpcxForcedEvent(base,cell),
      row={
        fixture:f.id,
        sourceRank:base.rank,
        actionCell:label(cell),
        role:role(cell),
        terminal:child.terminal?{
          player:child.terminal.player,
          lineId:child.terminal.lineId,
        }:null,
      };
    if(!child.terminal){
      const direct=findCpcxDirectThreeTriggerWingAttacks(child,{attacker:0})
          .filter(canonicalWing),
        progress=classifyCpcxProgress(child,{player:0});
      row.directRenewal=direct.map(w=>({
        lineId:w.anchoredLine.lineId,
        line:w.anchoredLine.lineCells.map(label),
        triggers:w.anchoredLine.triggerCells.map(label),
      }));
      row.progress=progressSummary(progress);
      row.oneStep=oneStep(child,progress);
    }
    rows.push(row);
  }
}

const roles=['BLOCK_A3','BLOCK_B3','SUPPLY_C2','EXTERNAL'];
const summary={};
for(const r of roles){
  const xs=rows.filter(x=>x.role===r),
    sig=x=>JSON.stringify({
      terminal:x.terminal,
      directRenewal:x.directRenewal??null,
      progress:x.progress??null,
      oneStep:x.oneStep??null,
    });
  summary[r]={
    occurrenceCount:xs.length,
    signatureClassCount:new Set(xs.map(sig)).size,
    terminalCount:xs.filter(x=>x.terminal).length,
    directRenewalCount:xs.filter(x=>(x.directRenewal?.length??0)>0).length,
    progressKinds:[...new Set(xs.map(x=>x.progress?.kind??'TERMINAL'))].sort(),
    macroKinds:[...new Set(xs.map(x=>x.progress?.macroKind).filter(Boolean))].sort(),
  };
}

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.one-support-short-wing-role-census.v0_1',
  stateClass:{
    mover:'P1',
    attacker:'P0',
    anchoredLine:'A3-B3-C3-D3',
    supportProfile:[0,0,1],
    playableTriggers:['A3','B3'],
    hiddenTrigger:'C3',
    uniqueSupport:'C2',
  },
  rows,
  summary,
  boundary:{
    diagnosticOnly:true,
    oneCurrentRoleEventOnly:true,
    oneExistingMacroStepMaximum:true,
    noRecursiveTraversal:true,
    solvedData:false,
    oracle:false,
    noValueConclusion:true,
  },
},null,2));
