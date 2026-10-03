import {
  createCpcxGeometry,
  buildCpcxPosition,
  cpcxCell,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  deriveCpcxSaturatedColumnRlcProfile,
} from './cpcx-saturated-column-cofactor.mjs';
import {
  certifyCpcxResidualDefectTransport,
} from './cpcx-residual-defect-transport.mjs';
import {
  deriveCpcxSingleOddCapacityDebt,
  certifyCpcxSingleOddCapacityDebtMacro,
} from './cpcx-parity-debt.mjs';

const g=createCpcxGeometry(),center=3,root='44444';

function label(cell){
  const {column,row}=cpcxCell(g,cell);
  return String.fromCharCode(65+column)+String(row+1);
}
function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}
function dominates(a,b){
  return a.A>=b.A&&a.B>=b.B&&(a.A>b.A||a.B>b.B);
}
function maxima(profile){
  const xs=profile.candidates;
  return xs.filter(x=>!xs.some(y=>y!==x&&dominates(y,x)));
}
function commonColumns(a,b){
  const B=new Set(b.map(x=>x.column));
  return a.filter(x=>B.has(x.column)).map(x=>x.column).sort((u,v)=>u-v);
}
function responseFor(debtColumn,triggerColumn){
  const d=Math.abs(debtColumn-center);
  if(d===1)return debtColumn;
  if(d===2)
    return triggerColumn===0||triggerColumn===6
      ?debtColumn
      :triggerColumn;
  if(d===3)return triggerColumn;
  throw new Error('unexpected debt distance');
}
function commonPareto(left,right){
  const L=deriveCpcxSaturatedColumnRlcProfile(left,{column:center}),
    R=deriveCpcxSaturatedColumnRlcProfile(right,{column:center});
  if(!L.exact||!R.exact)throw new Error('RLC profile failed');
  const lm=maxima(L),rm=maxima(R);
  return {left:lm,right:rm,common:commonColumns(lm,rm)};
}
function transportPair(left,right,eventCell){
  const t=certifyCpcxResidualDefectTransport(left,right,{
    eventCell,
    saturatedColumn:center,
  });
  if(!t.exact)throw new Error('defect transport '+t.seam);
  return {
    transport:t,
    left:applyCpcxForcedEvent(left,eventCell),
    right:applyCpcxForcedEvent(right,eventCell),
  };
}

const rows=[];
for(const x of [0,1,2,4,5,6]){
  const sourceLeft=buildCpcxPosition('44444'+(x+1)+'4',{geometry:g}),
    sourceRight=buildCpcxPosition('444444'+(x+1),{geometry:g}),
    sourceDebt=deriveCpcxSingleOddCapacityDebt(sourceLeft,{
      excludedColumns:[center],
    });
  if(!sourceDebt.exact||sourceDebt.debtColumn!==x)
    throw new Error('initial debt mismatch');

  for(const event1 of frontier(sourceLeft)){
    const e1=cpcxCell(g,event1).column,
      r1=responseFor(sourceDebt.debtColumn,e1),
      pareto1=commonPareto(
        applyCpcxForcedEvent(sourceLeft,event1),
        applyCpcxForcedEvent(sourceRight,event1)
      );
    if(!pareto1.common.includes(r1))
      throw new Error('first response not common Pareto');

    const debtMacro1=certifyCpcxSingleOddCapacityDebtMacro(sourceLeft,{
      debtColumn:sourceDebt.debtColumn,
      triggerColumn:e1,
      responseColumn:r1,
      excludedColumns:[center],
    });
    if(debtMacro1.kind!=='SINGLE_ODD_CAPACITY_DEBT_TRANSPORT')
      throw new Error('first debt macro '+debtMacro1.kind);

    const t1=transportPair(sourceLeft,sourceRight,event1);
    if(t1.left.terminal||t1.right.terminal)continue;
    const responseCell1=
      t1.left.heights[r1]*g.columns+r1,
      t2=transportPair(t1.left,t1.right,responseCell1);
    if(t2.left.terminal||t2.right.terminal){
      rows.push({
        x:x+1,
        event1:label(event1),
        response1:r1+1,
        debt1:debtMacro1.debtColumnAfter+1,
        firstMacroTerminal:true,
        terminalLeft:t2.left.terminal,
        terminalRight:t2.right.terminal,
      });
      continue;
    }

    const afterDebt=deriveCpcxSingleOddCapacityDebt(t2.left,{
      excludedColumns:[center],
    });
    if(!afterDebt.exact||
       afterDebt.debtColumn!==debtMacro1.debtColumnAfter)
      throw new Error('post-macro debt mismatch');

    const second=[];
    for(const event2 of frontier(t2.left)){
      const e2=cpcxCell(g,event2).column,
        trigger2Left=applyCpcxForcedEvent(t2.left,event2),
        trigger2Right=applyCpcxForcedEvent(t2.right,event2),
        transport2=certifyCpcxResidualDefectTransport(t2.left,t2.right,{
          eventCell:event2,
          saturatedColumn:center,
        });

      if(!transport2.exact)
        throw new Error('second trigger transport '+transport2.seam);

      if(trigger2Left.terminal||trigger2Right.terminal){
        second.push({
          event2:label(event2),
          terminal:true,
          terminalLeft:trigger2Left.terminal,
          terminalRight:trigger2Right.terminal,
          transportKind:transport2.kind,
        });
        continue;
      }

      const pareto2=commonPareto(trigger2Left,trigger2Right),
        r2=responseFor(afterDebt.debtColumn,e2),
        debtMacro2=certifyCpcxSingleOddCapacityDebtMacro(t2.left,{
          debtColumn:afterDebt.debtColumn,
          triggerColumn:e2,
          responseColumn:r2,
          excludedColumns:[center],
        }),
        legalResponse=
          trigger2Left.heights[r2]<g.rows&&
          trigger2Right.heights[r2]<g.rows;

      second.push({
        event2:label(event2),
        event2Column:e2+1,
        debtBefore:afterDebt.debtColumn+1,
        debtDistance:Math.abs(afterDebt.debtColumn-center),
        candidateResponse:r2+1,
        legalResponse,
        commonParetoColumns:pareto2.common.map(c=>c+1),
        candidateIsCommonPareto:pareto2.common.includes(r2),
        debtMacroKind:debtMacro2.kind,
        debtAfter:debtMacro2.debtColumnAfter===undefined
          ?null
          :debtMacro2.debtColumnAfter+1,
        topExhaustion:
          debtMacro2.kind==='TOP_EXHAUSTION_DEBT_BOUNDARY',
      });
    }

    rows.push({
      x:x+1,
      event1:label(event1),
      response1:r1+1,
      debt1:afterDebt.debtColumn+1,
      defectSizeAfterFirstMacro:t2.transport.targetDefectSize??null,
      second,
    });
  }
}

const allSecond=rows.flatMap(r=>(r.second??[]).map(x=>({
    x:r.x,
    event1:r.event1,
    response1:r.response1,
    debt1:r.debt1,
    ...x,
  }))),
  nonterminal=allSecond.filter(x=>!x.terminal),
  badPareto=nonterminal.filter(x=>
    !x.topExhaustion&&!x.candidateIsCommonPareto
  ),
  illegal=nonterminal.filter(x=>
    !x.topExhaustion&&!x.legalResponse
  );

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.center-spine-debt-rule-second-layer-falsifier.v0_1',
  observation:'one additional adversary layer after applying the defect-distance common-RLC response and updating the single odd-capacity debt column',
  rows,
  summary:{
    firstMacroCount:rows.length,
    secondEventCount:allSecond.length,
    secondNonterminalCount:nonterminal.length,
    topExhaustionBoundaryCount:nonterminal.filter(x=>x.topExhaustion).length,
    candidateCommonParetoSuccessCount:
      nonterminal.filter(x=>
        x.topExhaustion||x.candidateIsCommonPareto
      ).length,
    candidateCommonParetoFailureCount:badPareto.length,
    illegalCandidateCount:illegal.length,
    failures:badPareto.slice(0,24),
    illegal:illegal.slice(0,24),
  },
  boundary:{
    diagnosticFalsifierOnly:true,
    secondLayerNotProofAuthority:true,
    noSolvedData:true,
    noOracle:true,
    noMinimax:true,
    noRecursiveSearchClaim:true,
  },
},null,2));
