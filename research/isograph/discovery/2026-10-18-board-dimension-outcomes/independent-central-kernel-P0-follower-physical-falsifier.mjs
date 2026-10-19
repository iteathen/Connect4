// Independent original-grid first-win-stopped physical falsifier for frozen
// deterministic P0 follower HYPOTHESIS. Adversarial P1 branching is restricted
// to the VALIDATOR; source strategy does not evaluate alternative futures.
import {createCentralKernelP0FollowerCandidate} from './source-central-kernel-P0-vertical-follower-candidate.mjs';
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
function geometry(W,H,K){
 const lines=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of dirs){
  const ey=y+(K-1)*dy,ex=x+(K-1)*dx;
  if(ex<0||ex>=W||ey<0||ey>=H)continue;
  let mask=0n;
  for(let t=0;t<K;t++)mask|=1n<<BigInt((y+t*dy)*W+x+t*dx);
  lines.push({mask,x,y,dx,dy});
 }
 const incidence=Array.from({length:W*H},()=>[]);
 for(const line of lines)
  for(let i=0;i<W*H;i++)if((line.mask&(1n<<BigInt(i)))!==0n)incidence[i].push(line);
 return {lines,incidence};
}
function runFixture(W,H,K,maxStates=300000){
 const policy=createCentralKernelP0FollowerCandidate({width:W,height:H,connect:K});
 const {lines,incidence}=geometry(W,H,K);
 const N=W*H;
 const seen=new Set(),stats={
  W,H,K,originalGeometricLines:lines.length,sourceStatus:policy.status,
  physicalStateVisits:0,p1AlternativeMoves:0,p0Responses:0,
  p0Wins:0,p1Wins:0,draws:0,illegalResponses:0,
  validatorStateBudget:maxStates,
  witness:null,sourceGameValuesEvaluated:0
 };
 function place(q,c,p){
  if(!Number.isInteger(c)||c<0||c>=W||q.h[c]>=H)
   throw Error('PHYSICAL_ILLEGAL_LANDING');
  const row=q.h[c],id=row*W+c,b=1n<<BigInt(id);
  if(((q.p0|q.p1)&b)!==0n)throw Error('PHYSICAL_DOUBLE_OWNERSHIP');
  const p0=p===0?q.p0|b:q.p0,p1=p===1?q.p1|b:q.p1,own=p===0?p0:p1;
  let newH=q.h.slice();newH[c]++;
  const win=incidence[id].find(x=>(own&x.mask)===x.mask);
  return {q:{h:newH,p0,p1},win,full:newH.every(x=>x===H),
   placed:{oneBasedCol:c+1,oneBasedRow:row+1,player:p}};
 }
 const root=place({h:Array(W).fill(0),p0:0n,p1:0n},policy.firstOriginalColumn,0);
 if(root.win)throw Error('K4 opening terminal impossible');
 function dfs(q,hist){
  const key=q.h.join(',')+'|'+q.p0.toString(16)+'|'+q.p1.toString(16);
  if(seen.has(key))return 'SAFE';
  seen.add(key);
  stats.physicalStateVisits++;
  if(stats.physicalStateVisits>maxStates)return 'INCOMPLETE_BUDGET';
  for(let c=0;c<W;c++){
   if(q.h[c]>=H)continue;
   stats.p1AlternativeMoves++;
   const p1=place(q,c,1);
   if(p1.win){
    stats.p1Wins++;
    stats.witness={
     oneBasedLiteralHistory:hist.concat(c+1).join(''),
     P1TerminalOriginalLine:{startOneBased:[p1.win.x+1,p1.win.y+1],direction:[p1.win.dx,p1.win.dy]},
     terminalPly:hist.length+1,
     lastMove:p1.placed,
     previousHeights:q.h.slice(),
     originalBoard:[W,H,K]
    };
    return 'P1_WIN_COUNTEREXAMPLE';
   }
   if(p1.full){stats.draws++;continue;}
   const ans=policy.respond({originalHeightBeforeP1:q.h,p1Column:c});
   if(ans.p0Column===null){stats.illegalResponses++;return 'POLICY_NO_LEGAL_RESPONSE';}
   if(p1.q.h[ans.p0Column]!==ans.rowAfterP1){stats.illegalResponses++;return 'POLICY_ROW_DISCREPANCY';}
   const p0=place(p1.q,ans.p0Column,0);
   stats.p0Responses++;
   if(p0.win){stats.p0Wins++;continue;}
   if(p0.full){stats.draws++;continue;}
   const result=dfs(p0.q,hist.concat(c+1,ans.p0Column+1));
   if(result!=='SAFE')return result;
  }
  return 'SAFE';
 }
 const result=dfs(root.q,[policy.firstOriginalColumn+1]);
 return {status:result,statistics:stats,
   statement:'This validates/falsifies one source candidate, NOT all possible P0 no-loss strategies',
   sourceFutureGameWDLQueried:0,independentOpponentBranchValidation:true};
}
export function runCentralKernelP0FollowerFalsifier(){
 const results=[];
 for(const [W,H,K] of [[4,4,4],[5,4,4],[4,6,4],[5,6,4]]){
  try{results.push(runFixture(W,H,K,300000))}
  catch(e){results.push({status:'PHYSICAL_HARNESS_FAILURE',W,H,K,error:String(e)})}
 }
 return {results,anyCounterexample:results.some(x=>x.status==='P1_WIN_COUNTEREXAMPLE'),
  totalPhysicalAdversarialMoves:results.reduce((a,b)=>a+(b.statistics?.p1AlternativeMoves??0),0),
  zeroSourceFutureGameWDLEvaluations:true};
}
