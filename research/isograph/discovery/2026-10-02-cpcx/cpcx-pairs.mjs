// CPCX same-column response-pair policy algebra.
//
// This module does not choose moves.  It compiles the consequence of a declared
// trigger/response policy into neutral response pairs plus explicit deviation
// debt.  Distinct completed pairs commute because each consumes two events in
// one column and changes no other column.
//
// A policy theorem using this compiler must still prove that its trigger choices
// and deviation handling are sufficient before claiming W/D/L.

import {cpcxCell,cpcxColumnProfiles} from './cpcx.mjs';

export function compileCpcxSameColumnPairPolicy(position,{
  triggerOwner,
  responseOwner=triggerOwner^1,
  columns=Array.from({length:position.geometry.columns},(_,i)=>i),
}={}){
  if(triggerOwner!==0&&triggerOwner!==1)throw new RangeError('triggerOwner');
  if(responseOwner!==(triggerOwner^1))throw new RangeError('responseOwner must be opponent');
  const unique=[...new Set(columns)].sort((a,b)=>a-b);
  for(const c of unique)if(!Number.isInteger(c)||c<0||c>=position.geometry.columns)
    throw new RangeError('column');

  const profiles=cpcxColumnProfiles(position),plans=[];
  for(const column of unique){
    const p=profiles[column],pairs=[];
    for(let i=0;i<p.neutralPairCount;i++){
      const triggerRow=p.height+2*i,
        responseRow=triggerRow+1;
      pairs.push({
        pairIndex:i,
        triggerCell:triggerRow*position.geometry.columns+column,
        responseCell:responseRow*position.geometry.columns+column,
        triggerOwner,
        responseOwner,
      });
    }
    plans.push({
      column,
      startHeight:p.height,
      remaining:p.remaining,
      pairs,
      unmatchedTopDefect:p.unmatchedTopDefect
        ?{
          cell:(p.height+2*p.neutralPairCount)*position.geometry.columns+column,
          owner:triggerOwner,
          offset:2*p.neutralPairCount+1,
        }
        :null,
    });
  }

  return {
    schema:'connect4.cpcx.same-column-pair-policy.v0_1',
    triggerOwner,
    responseOwner,
    columns:unique,
    plans,
    exactUnderPolicy:true,
    policyCertified:false,
    pairCommutation:'completed pairs in distinct columns commute and each consumes exactly two events',
  };
}

export function projectCpcxPairPolicyOwners(policy){
  const facts=[];
  for(const plan of policy.plans){
    for(const pair of plan.pairs){
      facts.push({cell:pair.triggerCell,owner:pair.triggerOwner,kind:'PAIR_TRIGGER'});
      facts.push({cell:pair.responseCell,owner:pair.responseOwner,kind:'PAIR_RESPONSE'});
    }
    if(plan.unmatchedTopDefect)facts.push({
      cell:plan.unmatchedTopDefect.cell,
      owner:plan.unmatchedTopDefect.owner,
      kind:'UNMATCHED_TOP_TRIGGER',
    });
  }
  return facts.sort((a,b)=>a.cell-b.cell||a.owner-b.owner);
}

export function compileCpcxPairPolicyStep(position,policy,{triggerCell,actualReplyCell}={}){
  const g=position.geometry,
    trigger=cpcxCell(g,triggerCell),
    plan=policy.plans.find(x=>x.column===trigger.column);
  if(!plan)throw new RangeError('trigger outside policy columns');
  const pair=plan.pairs.find(x=>x.triggerCell===triggerCell);
  if(!pair)throw new RangeError('trigger is not a policy trigger cell');

  if(actualReplyCell===pair.responseCell)return {
    kind:'PAIR_HONORED',
    exact:true,
    triggerCell,
    responseCell:pair.responseCell,
    pairIndex:pair.pairIndex,
    column:trigger.column,
    parityDelta:0,
    debt:null,
  };

  const reply=actualReplyCell===null||actualReplyCell===undefined
    ?null
    :cpcxCell(g,actualReplyCell);
  return {
    kind:'PAIR_DEVIATION_DEBT',
    exact:true,
    triggerCell,
    requiredResponseCell:pair.responseCell,
    actualReplyCell:actualReplyCell??null,
    actualReplyColumn:reply?.column??null,
    column:trigger.column,
    pairIndex:pair.pairIndex,
    parityDelta:1,
    debt:{
      column:trigger.column,
      responseCell:pair.responseCell,
      triggerCell,
      token:`pair-debt:${triggerCell}->${pair.responseCell}`,
    },
    interpretation:'one expected response event was not consumed in the trigger column; the unmatched event is retained explicitly',
  };
}

export function compileCpcxAnchoredWingPairPlan(position,{
  player,
  anchorColumn,
  wingColumns,
  rows,
}={}){
  if(player!==0&&player!==1)throw new RangeError('player');
  if(!Number.isInteger(anchorColumn))throw new RangeError('anchorColumn');
  if(!Array.isArray(wingColumns)||!wingColumns.length)throw new RangeError('wingColumns');
  if(!Array.isArray(rows)||!rows.length)throw new RangeError('rows');

  const g=position.geometry,lines=[];
  for(const row of rows){
    if(!Number.isInteger(row)||row<0||row>=g.rows)throw new RangeError('row');
    const anchorCell=row*g.columns+anchorColumn;
    if(position.owner[anchorCell]!==player)continue;
    const wingCells=wingColumns.map(c=>row*g.columns+c);
    const line=g.lines.find(L=>
      L.cells.includes(anchorCell)&&
      wingCells.every(cell=>L.cells.includes(cell))
    );
    if(!line)continue;
    lines.push({
      row,
      lineId:line.id,
      anchorCell,
      wingCells,
      lineCells:[...line.cells],
    });
  }

  const policy=compileCpcxSameColumnPairPolicy(position,{
    triggerOwner:player,
    responseOwner:player^1,
    columns:wingColumns,
  });
  const ownerFacts=new Map(projectCpcxPairPolicyOwners(policy).map(x=>[x.cell,x.owner]));
  const guaranteedUnderHonoredPolicy=[];
  for(const line of lines){
    if(line.wingCells.every(cell=>ownerFacts.get(cell)===player))
      guaranteedUnderHonoredPolicy.push(line);
  }

  return {
    schema:'connect4.cpcx.anchored-wing-pair-plan.v0_1',
    player,
    anchorColumn,
    wingColumns:[...wingColumns],
    rows:[...rows],
    policy,
    anchoredLines:lines,
    guaranteedUnderHonoredPolicy,
    exactUnderHonoredPolicy:true,
    deviationHandlingCertified:false,
    proofBoundary:'a defender deviation creates explicit pair debt; this module does not yet prove the debt is losing',
  };
}
