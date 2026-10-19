// Independent original-gravity, four-K-direction, first-win-stopped
// colored-board falsifier of the frozen SOURCE P0 support-mirror policy.
// P1 alternative branches are enumerated ONLY IN THIS VALIDATOR.
// Source theorem forbids P1 first WIN for H<K,K<=W<=2K-1,K>=3.
import {createP0TopSupportMirrorHorizontalKernel} from './source-p0-top-support-mirror-horizontal-kernel.mjs';
const directions=[[1,0],[0,1],[1,1],[1,-1]];
function originalLines(W,H,K) {
 const lines=[],byCell=Array.from({length:W*H},()=>[]);
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of directions) {
  const ex=c+(K-1)*dx,ey=r+(K-1)*dy;
  if(ex<0||ex>=W||ey<0||ey>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){
   const z=(r+j*dy)*W+c+j*dx;
   ids.push(z);mask|=1n<<BigInt(z);
  }
  const line={mask,start:[c,r],direction:[dx,dy]};
  lines.push(line);for(let z of ids)byCell[z].push(line);
 }
 return {lines,byCell};
}
function testOneOriginal(W,H,K,maxStates=250000){
 const policy=createP0TopSupportMirrorHorizontalKernel({width:W,height:H,connect:K});
 const {lines,byCell}=originalLines(W,H,K),seen=new Set(),N=W*H;
 const stats={W,H,K,geometricOriginalLines:lines.length,
   sourceRootValueLowerBound:policy.P0relativeLowerBound,
   sourceRootValueExact:policy.P0relativeExactWDL,
   uniquePhysicalStateVisits:0,
   originalP1AlternativeMoves:0,legalSourceP0Replies:0,
   P0TerminalFirstWins:0,P1TerminalFirstWins:0,terminalFullBoardDraws:0,
   budgetIncomplete:false,negativeWitness:null,sourceAlternativeGameValuesEvaluated:0};
 function put(pos,col,owner){
  const h=pos.h;if(col<0||col>=W||h[col]>=H)
    throw Error('ORIGINAL_ILLEGAL_GRAVITY_PLACEMENT');
  const r=h[col],z=r*W+col,m=1n<<BigInt(z);
  if(((pos.p0|pos.p1)&m)!==0n)
    throw Error('ORIGINAL_REPEAT_CELL_OWNERSHIP');
  const p0=owner===0?pos.p0|m:pos.p0,p1=owner===1?pos.p1|m:pos.p1;
  const own=owner===0?p0:p1;
  const win=byCell[z].find(L=>(own&L.mask)===L.mask);
  const nh=h.slice();nh[col]++;
  return {position:{h:nh,p0,p1},win,originalRow:r,
    boardFull:nh.every(x=>x===H)};
 }
 let root=put({h:Array(W).fill(0),p0:0n,p1:0n},policy.opening(),0);
 if(root.win)throw Error('P0 cannot win on first K>=3 stone');
 if(root.boardFull) {
  stats.terminalFullBoardDraws++;
  return {status:'COMPLETE_P0_SOURCE_NONLOSS',...stats};
 }
 function dfs(pos,history){
  const key=pos.h.join('.')+'|'+pos.p0.toString(16)+'|'+pos.p1.toString(16);
  if(seen.has(key))return 'PASS';
  seen.add(key);stats.uniquePhysicalStateVisits++;
  if(stats.uniquePhysicalStateVisits>maxStates)return 'INCOMPLETE_PHYSICAL_BUDGET';
  let foundLegal=false;
  for(let c=0;c<W;c++){
   if(pos.h[c]>=H)continue;
   foundLegal=true;stats.originalP1AlternativeMoves++;
   const p1=put(pos,c,1);
   const prefix=history.concat(c+1);
   if(p1.win){
    stats.P1TerminalFirstWins++;
    stats.negativeWitness={literalColumnHistoryOneBased:prefix.join(''),
      originalFirstWinP1Line:p1.win,
      lastOriginalP1Row:p1.originalRow,originalHeightsBefore:pos.h.slice()};
    return 'P1_FIRST_WIN_FALSIFIER';
   }
   if(p1.boardFull) {stats.terminalFullBoardDraws++;continue;}
   const ans=policy.reply({heightsBeforeP1:pos.h,p1Column:c});
   if(ans.p0Column===null){
    stats.negativeWitness={literalColumnHistoryOneBased:prefix.join(''),
      issue:'SOURCE_NO_REPLY_BEFORE_FULL',originalHeightsBefore:pos.h.slice()};
    return 'ILLEGAL_OR_MISSING_P0_RESPONSE';
   }
   const p0=put(p1.position,ans.p0Column,0);
   if(ans.p0LandingRow!==p0.originalRow){
    stats.negativeWitness={literalColumnHistoryOneBased:prefix.concat(ans.p0Column+1).join(''),
      issue:'SOURCE_ORIGINAL_ROW_MISMATCH'};
    return 'WRONG_RESPONSE_PHYSICAL_ROW';
   }
   stats.legalSourceP0Replies++;
   if(p0.win){stats.P0TerminalFirstWins++;continue}
   if(p0.boardFull){stats.terminalFullBoardDraws++;continue;}
   const x=dfs(p0.position,prefix.concat(ans.p0Column+1));
   if(x!=='PASS')return x;
  }
  if(!foundLegal)throw Error('nonterminal state with no legal moves');
  return 'PASS';
 }
 const status=dfs(root.position,[policy.opening()+1]);
 stats.budgetIncomplete=status==='INCOMPLETE_PHYSICAL_BUDGET';
 return {status:status==='PASS'?'COMPLETE_P0_SOURCE_NONLOSS':status,...stats,
    independentValidatorBranchesIntoP1Moves:true};
}
export function independentP0TopSupportKernelCampaign(){
 const completed=[],incomplete=[],errors=[];
 const seedFixtures=[];
 for(let K=3;K<=7;K++)for(let H=1;H<K&&H<=5;H++)
  for(let W=K;W<=2*K-1;W++){
   if(W*H>24)continue;
   seedFixtures.push({W,H,K});
  }
 for(const {W,H,K} of seedFixtures) {
  try{const r=testOneOriginal(W,H,K,250000);
   if(r.status==='COMPLETE_P0_SOURCE_NONLOSS')completed.push(r);
   else if(r.budgetIncomplete)incomplete.push(r);
   else errors.push(r);
  }catch(e){errors.push({W,H,K,error:String(e)})}
 }
 const sum=key=>completed.reduce((a,b)=>a+b[key],0);
 // Real original counterexample to dropping the common-column condition:
 // W=2K,H=2,K>=3. P0 opens c0 and P1 fills K bottom cells in c=K..2K-1,
 // while P0 can only follow up. P1 wins the bottom row on its Kth attack.
 const neg=[];
 for(const K of [3,4,5]){
  const W=2*K,H=2,{byCell}=originalLines(W,H,K);
  let pos={h:Array(W).fill(0),p0:0n,p1:0n},word=[];
  function place(c,p){
   const r=pos.h[c],z=r*W+c,bit=1n<<BigInt(z);
   if(pos.h[c]>=H||((pos.p0|pos.p1)&bit)!==0n)
    throw Error('negative fixture invalid source gravity');
   pos.h[c]++;
   if(p===0)pos.p0|=bit;else pos.p1|=bit;
   word.push(c+1);
   const own=p===0?pos.p0:pos.p1;
   return byCell[z].some(line=>(own&line.mask)===line.mask);
  }
  place(0,0);
  let terminalStep=0;
  for(let c=K;c<2*K;c++){
    if(place(c,1)){terminalStep=word.length;break;}
    if(place(c,0))throw Error('P0 unexpectedly first-won guard-negative');
  }
  neg.push({W,H,K,wordOneBased:word.join(''),firstWinner:terminalStep?'P1':null,
   firstWinMove:terminalStep});
 }
 return {status:errors.length?'SOURCE_POLICY_COUNTEREXAMPLE':
   incomplete.length?'PARTIAL_PHYSICAL_BUDGET':'ALL_SOURCE_TOP_SUPPORT_NONLOSS_PHYSICAL_PASS',
   completeFixtures:completed.length,incompleteFixtures:incomplete.length,
   testedPhysicalUniqueStates:sum('uniquePhysicalStateVisits'),
   totalAdversarialP1OriginalActions:sum('originalP1AlternativeMoves'),
   totalP0SourceReplyActions:sum('legalSourceP0Replies'),
   P0FirstWinStops:sum('P0TerminalFirstWins'),
   P1FirstWinStops:sum('P1TerminalFirstWins'),
   drawnTerminals:sum('terminalFullBoardDraws'),
   byK:Object.fromEntries([3,4,5,6,7].map(K=>[K,completed.filter(x=>x.K===K).length])),
   evenAreaExactDrawCases:completed.filter(x=>(x.W*x.H)%2===0).length,
   negativeBeyondWidthThreshold:neg,
   budgetCases:incomplete.map(r=>({W:r.W,H:r.H,K:r.K,states:r.uniquePhysicalStateVisits})),
   counterexamples:errors.map(r=>({W:r.W,H:r.H,K:r.K,
     status:r.status,error:r.error??null,witness:r.negativeWitness??null})),
   sourceFutureGameWDLQueries:0};
}
