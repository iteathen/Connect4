// Independent PHYSICAL original-grid adversarial falsification of a FROZEN
// source defender policy. This checker enumerates attacker alternatives only
// as independent VALIDATION; source algorithm does NOT search any future games.
// Exact proof is the mathematical row-pair invariant, not this finite control.
import {createNarrowWidthKDrawDefense} from './source-arbitrary-k-narrow-width-pair-defense.mjs';
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
function originalLines(W,H,K) {
 const out=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of DIRS){
  const ex=c+(K-1)*dx,ey=r+(K-1)*dy;
  if(ex<0||ex>=W||ey<0||ey>=H)continue;
  let mask=0n;
  for(let j=0;j<K;j++)mask|=1n<<BigInt((r+j*dy)*W+c+j*dx);
  out.push(mask);
 }
 return out;
}
function checkFixture(W,H,K,D,maxStates=120000){
 const strategy=createNarrowWidthKDrawDefense({width:W,height:H,connect:K,defender:D});
 const lines=originalLines(W,H,K),inc=Array.from({length:W*H},()=>[]);
 for(const L of lines)for(let z=0;z<W*H;z++)if((L&(1n<<BigInt(z)))!==0n)inc[z].push(L);
 const n=W*H;
 let memo=new Set(),stateVisits=0,physicalAttackerChoices=0,physicalDefenderReplies=0,
     attackerFirstWins=0,defenderFirstWins=0,drawTerminals=0;
 function put(q,c,p){
  let [h,p0,p1]=q;
  if(c<0||c>=W||h[c]>=H)throw Error('illegal original physical gravity landing');
  let z=h[c]*W+c,b=1n<<BigInt(z);
  if(((p0|p1)&b)!==0n)throw Error('repeated physical cell');
  h=h.slice();h[c]++;
  if(p===0)p0|=b;else p1|=b;
  const owned=p===0?p0:p1;
  const win=inc[z].some(L=>(owned&L)===L);
  return {q:[h,p0,p1],win,full:h.every(x=>x===H),row:z/W|0};
 }
 let root=[Array(W).fill(0),0n,0n];
 if(D===0) {
  const init=put(root,strategy.firstMove(),0);
  if(init.win)throw Error('opening first win impossible in K>=3');
  root=init.q;
 }
 function explore(q,depth){
  const [h,p0,p1]=q;
  const key=h.join(',')+'|'+p0.toString(16)+'|'+p1.toString(16);
  if(memo.has(key))return;
  memo.add(key);stateVisits++;
  if(stateVisits>maxStates)throw Error('PHYSICAL_VALIDATOR_RESOURCE_BUDGET');
  let any=false;
  for(let c=0;c<W;c++){
   if(h[c]>=H)continue;
   any=true;physicalAttackerChoices++;
   const pre=h.slice(),a=put(q,c,1-D);
   if(a.win){attackerFirstWins++;throw Error('PHYSICAL_FALSIFIER_ATTACKER_FIRST_WIN');}
   if(a.full){drawTerminals++;continue;}
   const act=strategy.response({heightBeforeAttack:pre,attackerColumn:c,attackerRow:pre[c]});
   if(act.column===null)throw Error('source responder unexpectedly lacks legal move');
   physicalDefenderReplies++;
   const d=put(a.q,act.column,D);
   if(d.win){defenderFirstWins++;continue;}
   if(d.full){drawTerminals++;continue;}
   explore(d.q,depth+2);
  }
  if(!any&&h.some(z=>z<H))throw Error('no attacker move while board not full');
 }
 if(root[0].every(x=>x===H))drawTerminals++;
 else explore(root,D===0?1:0);
 return {W,H,K,defender:D,lines:lines.length,stateVisits,
  physicalAttackerChoices,physicalDefenderReplies,
  attackerFirstWins,defenderFirstWins,drawTerminals,
  sourceFutureGameValuesEvaluated:0,fullyExplored:true};
}
export function independentNarrowWidthPhysicalPolicyCampaign(){
 const results=[],incomplete=[],failures=[];
 for(let K=3;K<=6;K++){
  const maxW=Math.min(K-1,3),maxH=K===3?7:K===4?6:5;
  for(let W=1;W<=maxW;W++)for(let H=1;H<=maxH;H++)for(let D=0;D<=1;D++){
   try{results.push(checkFixture(W,H,K,D));}
   catch(e){
    if(String(e).includes('RESOURCE_BUDGET'))incomplete.push({W,H,K,D});
    else failures.push({W,H,K,D,error:String(e)});
   }
  }
 }
 return {status:failures.length?'PHYSICAL_POLICY_COUNTEREXAMPLE':incomplete.length?
     'PHYSICAL_CONTROL_PARTIALLY_BUDGETED':'PHYSICAL_POLICY_ALL_UNIVERSAL_RESPONSES_PASS',
  completeCases:results.length,incompleteCases:incomplete.length,failures,
  incomplete:incomplete.slice(0,20),
  physicalOriginalAttackerChoices:results.reduce((a,b)=>a+b.physicalAttackerChoices,0),
  exactOriginalResponseMoves:results.reduce((a,b)=>a+b.physicalDefenderReplies,0),
  distinctOriginalPolicyStates:results.reduce((a,b)=>a+b.stateVisits,0),
  physicalAttackerFirstWins:results.reduce((a,b)=>a+b.attackerFirstWins,0),
  byK:Object.fromEntries([3,4,5,6].map(K=>[K,results.filter(v=>v.K===K).length])),
  sourceStrategyGameValuesQueried:0,
  note:'Branch traversal is independent PHYSICAL validation; no source branching WDL algorithm is claimed'};
}
