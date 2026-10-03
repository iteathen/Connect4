import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  certifyCpcxOneDefectTargetReservoirRcic,
} from './cpcx-one-defect-rcic.mjs';

const g=createCpcxGeometry();

const controls=[
  {name:'F9',sequence:'4444441123',setupColumn:2,target:3*g.columns+4},
  {name:'F17',sequence:'4444417765',setupColumn:4,target:3*g.columns+2},
  {name:'F18',sequence:'4444417465',setupColumn:4,target:3*g.columns+2},
  {name:'GAP',sequence:'4444427765',setupColumn:4,target:3*g.columns+2},
];

function summarizeFailure(failure,depth=0){
  if(!failure||depth>5)return failure??null;
  const out={
    kind:failure.kind??null,
    seam:failure.seam??null,
    key:failure.key??null,
    rank:failure.rank??null,
    measure:failure.measure??null,
    defenderCell:failure.defenderCell??null,
    defenderLabel:failure.defenderLabel??null,
    templateCount:failure.templateCount??null,
    evaluatedNodes:failure.evaluatedNodes??null,
  };
  if(Array.isArray(failure.failures))out.failures=failure.failures.slice(0,12).map(x=>({
    templateIndex:x.templateIndex??null,
    seam:x.seam??null,
    policyKind:x.policyKind??null,
    optionCount:x.optionCount??null,
    optionFailures:(x.optionFailures??[]).slice(0,12),
    templateDefectLabel:x.templateDefectLabel??null,
  }));
  if(failure.rootFailure)out.rootFailure=summarizeFailure(failure.rootFailure,depth+1);
  return out;
}

const rows=[];
for(const control of controls){
  const p=buildCpcxPosition(control.sequence,{geometry:g}),
    setupCell=p.heights[control.setupColumn]*g.columns+control.setupColumn,
    child=applyCpcxForcedEvent(p,setupCell),
    cert=child.terminal
      ?{kind:'TERMINAL',exact:true,terminal:child.terminal}
      :certifyCpcxOneDefectTargetReservoirRcic(child,{
        attacker:0,targetCell:control.target,maxNodes:4096,
      });
  rows.push({
    ...control,
    setupCell,
    childRank:child.rank,
    childMover:child.mover,
    result:{
      kind:cert.kind,
      exact:cert.exact??false,
      player:cert.player??null,
      seam:cert.seam??null,
      rootMeasure:cert.rootMeasure??null,
      nodeCount:cert.nodeCount??null,
      evaluatedNodeCount:cert.evaluatedNodeCount??null,
      edgeCount:cert.edgeCount??null,
      rootFailure:summarizeFailure(cert.rootFailure??cert),
    },
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.one-defect-rcic-control-diagnostic.v0_1',
  rows,
  premises:{
    standardBoard:'7x6',
    solvedData:false,
    oracle:false,
    delayEquivalenceAssumed:false,
    diagnosticOnly:true,
  },
},null,2));
