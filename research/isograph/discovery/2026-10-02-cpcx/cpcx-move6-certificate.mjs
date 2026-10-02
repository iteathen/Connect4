// CPCX universal disjoint-wing first-win attempt.
//
// The current mover is the defender relative to the requested attacker.
// The entire current legal frontier is quantified once as a flat response set.
// For each response, CPCX deterministically selects the untouched wing macro.
//
// Defender response classes inside that macro are:
//   1. honor both required same-column responses -> attacker first win;
//   2. deviate at the first response -> one abstract debt-repair successor;
//   3. honor first, deviate at the second -> one abstract debt-repair successor.
//
// Deviation classes are represented set-wise by deriveCpcxUniversalDebtRepair.
// There is no recursive legal-reply traversal.

import {compileCpcxPostActionWingAttack} from './cpcx-wing.mjs';
import {deriveCpcxUniversalDebtRepair} from './cpcx-debt.mjs';
import {
  createCpcxDebtRepairSuccessor,
  classifyCpcxSuccessor,
} from './cpcx-successor.mjs';

function frontierCells(position){
  const g=position.geometry,out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

function classResult(kind,attacker,detail){
  return {
    kind,
    attacker,
    ...detail,
  };
}

export function attemptCpcxDisjointWingFirstWin(position,{
  attacker=position.mover^1,
}={}){
  if(attacker!==0&&attacker!==1)throw new RangeError('attacker');
  const defender=attacker^1;
  if(position.mover!==defender)return {
    schema:'connect4.cpcx.disjoint-wing-first-win.v0_1',
    kind:'NO_CERTIFICATE',
    exact:false,
    attacker,
    seam:'DEFENDER_NOT_TO_MOVE',
    recursive:false,
  };

  const actions=frontierCells(position),
    rows=[];
  let firstSeam=null;

  for(const actionCell of actions){
    const wing=compileCpcxPostActionWingAttack(position,{
      actionCell,
      actionOwner:defender,
      attacker,
    });
    if(!wing.exact||wing.kind!=='THREE_TRIGGER_WING_ATTACK'){
      firstSeam??='NO_EXACT_WING_AFTER_DEFENDER_ACTION';
      rows.push({
        actionCell,
        actionColumn:actionCell%position.geometry.columns,
        exact:false,
        seam:'NO_EXACT_WING_AFTER_DEFENDER_ACTION',
      });
      continue;
    }

    const honored=wing.honoredPath.exact&&wing.honoredPath.terminalOnThirdTrigger
      ?classResult('CERTIFIED_FIRST_WIN',attacker,{
        source:'WING_HONORED_RESPONSES',
        exact:true,
      })
      :classResult('NO_CERTIFICATE',attacker,{
        exact:false,
        seam:'HONORED_WING_PATH_NOT_TERMINAL',
      });

    const firstRepair=deriveCpcxUniversalDebtRepair(position,wing,{decisionIndex:0}),
      firstSuccessor=createCpcxDebtRepairSuccessor(position,wing,firstRepair),
      firstNext=firstSuccessor.exact
        ?classifyCpcxSuccessor(firstSuccessor,{attacker})
        :firstSuccessor;

    const secondRepair=deriveCpcxUniversalDebtRepair(position,wing,{decisionIndex:1}),
      secondSuccessor=createCpcxDebtRepairSuccessor(position,wing,secondRepair),
      secondNext=secondSuccessor.exact
        ?classifyCpcxSuccessor(secondSuccessor,{attacker})
        :secondSuccessor;

    const responseClasses=[
      {
        class:'HONOR_BOTH',
        setWise:true,
        result:honored,
      },
      {
        class:'DEVIATE_FIRST',
        setWise:true,
        quantifiedCells:[...firstRepair.deviationFrontier],
        successor:firstSuccessor,
        result:firstNext,
      },
      {
        class:'HONOR_FIRST_DEVIATE_SECOND',
        setWise:true,
        quantifiedCells:[...secondRepair.deviationFrontier],
        successor:secondSuccessor,
        result:secondNext,
      },
    ];

    const allCertified=responseClasses.every(x=>
      x.result.kind==='CERTIFIED_FIRST_WIN'&&x.result.player===attacker||
      x.result.kind==='CERTIFIED_FIRST_WIN'&&x.result.attacker===attacker
    );

    if(!allCertified){
      const unresolved=responseClasses.find(x=>x.result.kind!=='CERTIFIED_FIRST_WIN');
      firstSeam??=unresolved?.result?.seam??unresolved?.result?.kind??'UNRESOLVED_RESPONSE_CLASS';
    }

    rows.push({
      actionCell,
      actionColumn:actionCell%position.geometry.columns,
      exact:true,
      selectedMacro:'THREE_TRIGGER_WING_ATTACK',
      survivingWing:[...wing.survivingFamily.columns],
      responseClasses,
      allResponseClassesCertified:allCertified,
    });
  }

  const allActionsCertified=rows.length===actions.length&&
    rows.every(x=>x.allResponseClassesCertified===true);

  return {
    schema:'connect4.cpcx.disjoint-wing-first-win.v0_1',
    kind:allActionsCertified?'CERTIFIED_FIRST_WIN':'NO_CERTIFICATE',
    exact:allActionsCertified,
    player:allActionsCertified?attacker:undefined,
    attacker,
    defender,
    currentResponseSet:[...actions],
    rows,
    universalCurrentResponseQuantification:true,
    flatResponseSetOnly:true,
    recursive:false,
    firstSeam:allActionsCertified?null:firstSeam,
    semantics:allActionsCertified
      ?'every current defender action enters a structurally selected attacker wing macro whose defender response classes all terminate in attacker first win'
      :'at least one abstract defender response class remains uncertified; no draw/loss/value inference is made',
  };
}
