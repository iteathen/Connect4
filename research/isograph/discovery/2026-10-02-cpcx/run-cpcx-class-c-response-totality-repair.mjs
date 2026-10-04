import {execFileSync} from 'node:child_process';

const endpointScript=new URL(
  './run-cpcx-move6-opponent-descent-endpoint-descriptors.mjs',
  import.meta.url
);

const endpoint=JSON.parse(execFileSync(process.execPath,[endpointScript.pathname],{
  encoding:'utf8',
  maxBuffer:512*1024*1024,
}));

const candidates=[];
for(const probe of endpoint.novelMaskSecondLayerProbes??[]){
  for(const row of probe.secondLayerRows??[]){
    const nt=row.noTransferTargetBlockProbe;
    const audit=nt?.exactProgressFirst?.postSuccessorActionAudit;
    if(!Array.isArray(audit))continue;
    for(const action of audit){
      if(!['D6','G4'].includes(action.actionCell))continue;
      for(const target of action.targetRcics??[]){
        if(target.targetCell!=='C3')continue;
        const gap=target.gap;
        if(gap?.rootGap!==2)continue;
        candidates.push({
          source:{
            firstLayerEventCell:probe.firstLayerEventCell??null,
            secondLayerEventCell:row.eventCell??null,
            blockedCell:nt.blockedCell??null,
            sourceMeasure:probe.sourceMeasure??null,
            endpointMeasure:probe.endpointMeasure??null,
          },
          actionCell:action.actionCell,
          targetCell:target.targetCell,
          gap,
        });
      }
    }
  }
}

function countBy(rows,keyFn){
  const out={};
  for(const row of rows){
    const k=keyFn(row)??'NULL';
    out[k]=(out[k]??0)+1;
  }
  return out;
}

const flatTriggers=[];
for(const c of candidates){
  for(const node of c.gap.unresolvedNodes??[]){
    for(const trigger of node.unresolvedTriggers??[]){
      flatTriggers.push({
        actionCell:c.actionCell,
        nodeRank:node.rank,
        nodeGap:node.gap,
        nodeSupport:node.support,
        nodeDescriptor:node.descriptor,
        defenderLabel:trigger.defenderLabel,
        defenderTerminal:trigger.defenderTerminal??null,
        optionCount:trigger.optionCount??0,
        options:trigger.options??[],
        rejected:trigger.rejected??[],
      });
    }
  }
}

const rejected=flatTriggers.flatMap(t=>
  (t.rejected??[]).map(r=>({
    actionCell:t.actionCell,
    nodeRank:t.nodeRank,
    defenderLabel:t.defenderLabel,
    responseLabel:r.responseLabel??null,
    role:r.role??null,
    childClass:r.childClass??null,
    childGap:r.childGap??null,
    seam:r.seam??null,
    lineLabels:r.lineLabels??[],
    childDescriptor:r.childDescriptor??null,
  }))
);

const result={
  schema:'connect4.cpcx.class-c-response-totality-repair-diagnostic.v0_1',
  root:'44444',
  candidateCount:candidates.length,
  candidates,
  summary:{
    candidateActions:[...new Set(candidates.map(x=>x.actionCell))].sort(),
    unresolvedTriggerCount:flatTriggers.length,
    unresolvedTriggerCells:countBy(flatTriggers,x=>x.defenderLabel),
    unresolvedTriggerByAction:countBy(flatTriggers,x=>x.actionCell),
    defenderTerminalCount:flatTriggers.filter(x=>x.defenderTerminal).length,
    zeroOptionTriggerCount:flatTriggers.filter(x=>(x.optionCount??0)===0).length,
    rejectionCount:rejected.length,
    rejectionSeams:countBy(rejected,x=>x.seam),
    rejectionRoles:countBy(rejected,x=>x.role),
    rejectionChildClasses:countBy(rejected,x=>x.childClass),
    rejected,
  },
  boundary:{
    diagnosticOnly:true,
    theoremResponseSetUnchanged:true,
    currentOpponentFrontierOnly:true,
    noArbitraryControllerResponses:true,
    noSolvedData:true,
    oracle:false,
    minimax:false,
    remoteness:false,
    recursiveSearch:false,
  },
};

console.log(JSON.stringify(result,null,2));
