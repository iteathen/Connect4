import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';

const g=createCpcxGeometry(),root=buildCpcxPosition('44444',{geometry:g}),rows=[];

for(let column=0;column<g.columns;column++){
  const actionCell=root.heights[column]*g.columns+column,
    wing=compileCpcxPostActionWingAttack(root,{
      actionCell,
      actionOwner:1,
      attacker:0,
    }),
    repair=deriveCpcxUniversalDebtRepair(root,wing,{decisionIndex:0}),
    vertical=repair.guaranteedResiduals.find(r=>
      r.missingCount===2&&r.orientation==='V'&&
      r.events.some(e=>e.minSupportDistance===0&&e.maxSupportDistance===0)&&
      r.events.some(e=>e.minSupportDistance===1&&e.maxSupportDistance===1)
    );

  rows.push({
    sixthMove:column+1,
    actionCell,
    untouchedWing:wing.survivingFamily.columns.map(x=>x+1),
    honoredPath:{
      exact:wing.honoredPath.exact,
      terminalOnThirdTrigger:wing.honoredPath.terminalOnThirdTrigger,
      terminal:wing.honoredPath.verification.terminal,
    },
    firstDeviation:{
      quantifiedFrontier:repair.deviationFrontier,
      firstWinGuardPassed:repair.firstWinGuardPassed,
      postRepairFirstWinGuardPassed:repair.postRepairFirstWinGuardPassed,
      repairLegal:repair.repairLegalAtDecision,
      guaranteedPairCount:repair.guaranteedResiduals.filter(x=>x.missingCount===2).length,
      verticalTwoPiece:vertical?{
        line:vertical.lineLabel,
        cells:vertical.missingCells,
        events:vertical.events,
      }:null,
    },
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6-structural-report.v0_1',
  root:'44444',
  productionCpcModified:false,
  oracleUsed:false,
  solvedValuesUsed:false,
  recursiveReplyTraversalUsed:false,
  rows,
  exactConclusions:[
    'every legal sixth action leaves a disjoint synchronized wing available',
    'if the first two same-column defender responses are honored, P0 terminals on the third wing trigger',
    'for every first response deviation, the omitted response is repairable under exact first-win guards',
    'every repaired first deviation leaves a deviation-invariant vertical two-piece P0 residual with support profile 0/1'
  ],
  unresolved:[
    'the global repeated-macro termination theorem is not yet closed',
    'higher-priority singleton normalization is required before every progress primitive',
    'the retained vertical-tempo falsifier forbids treating the raw 0/1 pair as unconditional force'
  ],
},null,2));
