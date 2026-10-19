// Independent ORIGINAL H=1 physical first-win-stopped checker.
// Enumerates ALL attacker legal continuations against one frozen D policy;
// checker branching is FALSIFICATION only, never SOURCE game-tree solving.
import {createOneRowPairDefender,classifyOneRowEmpty} from './source-one-row-all-K-pair-defense.mjs';
function policyControl(W,K,D,budget){
 const policy=createOneRowPairDefender({width:W,connect:K,defender:D});
 const windows=[];
 for(let c=0;c+K<=W;c++){let m=0;for(let i=0;i<K;i++)m|=1<<(c+i);windows.push(m);}
 const memo=new Set(),stats={W,K,defender:D,originalGeometricWinlines:windows.length,
    distinctPhysicalStates:0,attackerAlternatives:0,legalDefenderReplies:0,
    filledDrawEnds:0,defenderFirstWins:0,attackerFirstWins:0,sourceWDL:classifyOneRowEmpty({width:W,connect:K}).P0relativeWDL};
 const win=(m)=>windows.some(x=>(m&x)===x);
 function explore(p0,p1){
  const occupancy=p0|p1;
  if(occupancy===(1<<W)-1){stats.filledDrawEnds++;return}
  const key=p0+'|'+p1;
  if(memo.has(key))return;
  memo.add(key);
  stats.distinctPhysicalStates++;
  if(stats.distinctPhysicalStates>budget)throw Error('VALIDATION_RESOURCE_BUDGET');
  for(let c=0;c<W;c++){
   if(occupancy&(1<<c))continue;
   stats.attackerAlternatives++;
   const bit=1<<c;
   const a0=D===1?p0|bit:p0,a1=D===0?p1|bit:p1;
   if(win(D===1?a0:a1)){stats.attackerFirstWins++;throw Error('ATTACKER_FIRST_WIN_WITH_SOURCE_DEFENSE');}
   const occ=a0|a1;
   if(occ===(1<<W)-1){stats.filledDrawEnds++;continue;}
   const occupied=Array.from({length:W},(_,j)=>(occ&(1<<j))!==0);
   const reply=policy.response({occupiedAfterAttacker:occupied,attackerOriginalColumn:c+1});
   const mate=reply.column;
   if(mate===null||mate<1||mate>W||(occ&(1<<(mate-1))))
    throw Error('ILLEGAL_RESPONSE_SOURCE_ONE_ROW');
   stats.legalDefenderReplies++;
   const dBit=1<<(mate-1),d0=D===0?a0|dBit:a0,d1=D===1?a1|dBit:a1;
   if(win(D===0?d0:d1)){stats.defenderFirstWins++;continue;}
   explore(d0,d1);
  }
 }
 let p0=0,p1=0;
 if(D===0){const opening=policy.firstMove(),f=1<<(opening-1);p0|=f;}
 explore(p0,p1);
 return stats;
}
export function independentOneRowK3PlusCampaign(){
 const positives=[],incomplete=[],errors=[];
 for(let K=3;K<=8;K++)for(let W=1;W<=18;W++)for(let D=0;D<=1;D++){
  try{positives.push(policyControl(W,K,D,250000))}
  catch(e){
   if(String(e).includes('RESOURCE_BUDGET'))incomplete.push({W,K,D});
   else errors.push({W,K,D,error:String(e)})
  }
 }
 const count=(field)=>positives.reduce((a,b)=>a+b[field],0);
 return {status:errors.length?'PHYSICAL_POLICY_COUNTEREXAMPLE':incomplete.length?
   'INCOMPLETE_VALIDATION_BUDGET':'ALL_ONE_ROW_ATTACKER_BRANCHES_NO_WIN',
   guards:{KMin:3,KMax:8,widthMin:1,widthMax:18,height:1,defenders:[0,1]},
   completedFixtures:positives.length,incompleteFixtures:incomplete.length,
   distinctPhysicalStates:count('distinctPhysicalStates'),
   allAdversarialAttackerActions:count('attackerAlternatives'),
   legalPolicyDefenderResponses:count('legalDefenderReplies'),
   filledDrawEndings:count('filledDrawEnds'),
   defenderFirstWins:count('defenderFirstWins'),
   attackerFirstWins:count('attackerFirstWins'),
   maxFixtureStates:Math.max(...positives.map(x=>x.distinctPhysicalStates)),
   errors,incomplete,
   selectedCases:positives.filter(x=>x.W===9&&x.K===3||x.W===16&&x.K===4).slice(0,4),
   sourceFutureGameWDLQueries:0};
}
