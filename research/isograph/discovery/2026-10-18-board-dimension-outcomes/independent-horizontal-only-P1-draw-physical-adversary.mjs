// Independent full original-grid P0-branching falsification of a frozen
// SOURCE P1 response theorem. Brute opponent branches are independent
// VALIDATION ONLY, never a source WDL evaluation or algorithm input.
import {createHorizontalOnlyEvenAreaSecondDraw} from './source-horizontal-only-even-area-P1-draw-response.mjs';
function geometricLines(W,H,K) {
 const ds=[[1,0],[0,1],[1,1],[1,-1]], lines=[];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of ds){
  const ex=c+(K-1)*dx,ey=r+(K-1)*dy;
  if(ex<0||ex>=W||ey<0||ey>=H)continue;
  const cells=[];
  for(let j=0;j<K;j++)cells.push((r+j*dy)*W+c+j*dx);
  lines.push(cells);
 }
 return lines;
}
function exhaustiveP0AgainstFrozenSource(W,H,K,maxStates) {
 const source=createHorizontalOnlyEvenAreaSecondDraw({width:W,height:H,connect:K});
 const N=W*H,lines=geometricLines(W,H,K), incidence=Array.from({length:N},()=>[]);
 lines.forEach((L,i)=>L.forEach(z=>incidence[z].push(i)));
 const fingerprints=new Set(),stats={W,H,K,geometricLines:lines.length,
  uniqueOriginalPhysicalStates:0,physicalP0Choices:0,physicalP1Replies:0,
  drawEndpoints:0,p0FirstWins:0,p1FirstWins:0,
  secondSourcePolicyFutureGameValues:0,
  fullRootOpponentAlternativesEnumeratedInValidator:true};
 function place(q,c,owner){
  const h=q.h;
  if(c<0||c>=W||h[c]>=H)throw Error('illegal gravity move');
  const z=h[c]*W+c,flag=1n<<BigInt(z);
  if(((q.p0|q.p1)&flag)!==0n)throw Error('occupied source cell');
  let occupied=owner===0 ? q.p0|flag : q.p1|flag;
  const win=incidence[z].some(idx=>lines[idx].every(i=>(occupied&(1n<<BigInt(i)))!==0n));
  const nx={h:h.slice(),p0:owner===0?occupied:q.p0,p1:owner===1?occupied:q.p1};
  nx.h[c]++;
  return {state:nx,win,full:nx.h.every(x=>x===H)};
 }
 function explore(q){
  const key=q.h.join('.')+'|'+q.p0.toString(16)+'|'+q.p1.toString(16);
  if(fingerprints.has(key))return;
  fingerprints.add(key);stats.uniqueOriginalPhysicalStates++;
  if(stats.uniqueOriginalPhysicalStates>maxStates)throw Error('VALIDATOR_BUDGET_EXCEEDED');
  for(let c=0;c<W;c++){
   if(q.h[c]>=H)continue;
   stats.physicalP0Choices++;
   const p0=place(q,c,0);
   if(p0.win){stats.p0FirstWins++;throw Error('P0_FIRST_WIN_UNDER_P1_POLICY');}
   if(p0.full)throw Error('odd-ply board full although WH even');
   const resp=source.reply({heightsBeforeP0:q.h,p0Column:c});
   const p1=place(p0.state,resp.originalP1Column,1);
   stats.physicalP1Replies++;
   if(resp.p0PhysicalRow!==q.h[c])throw Error('reported P0 row inconsistent');
   if(resp.p1PhysicalRow!==p0.state.h[resp.originalP1Column])
    throw Error('reported P1 row inconsistent');
   if(p1.win){stats.p1FirstWins++;throw Error('P1_FIRST_WIN_UNDER_DRAW_POLICY');}
   if(p1.full){stats.drawEndpoints++;continue;}
   explore(p1.state);
  }
 }
 explore({h:Array(W).fill(0),p0:0n,p1:0n});
 return stats;
}
export function runHorizontalOnlySecondDrawCampaign(){
 const done=[],incomplete=[],errors=[],rejections=[];
 for(let K=3;K<=6;K++)for(let H=1;H<K;H++)for(let W=1;W<=9;W++){
  if(W*H%2 || W*H>22)continue;
  try{done.push(exhaustiveP0AgainstFrozenSource(W,H,K,200000))}
  catch(e){if(String(e).includes('BUDGET_EXCEEDED'))incomplete.push({W,H,K});
   else errors.push({W,H,K,error:String(e)})}
 }
 for(const [W,H,K] of [[3,3,4],[6,4,4],[1,3,3],[5,5,3],[4,2,2]]) {
  try{
   createHorizontalOnlyEvenAreaSecondDraw({width:W,height:H,connect:K});
   errors.push({kind:'WRONG_GUARD_ACCEPTED',W,H,K});
  }catch(e){rejections.push({W,H,K,error:String(e)})}
 }
 const total={tested:done.length,resourceIncomplete:incomplete.length,
  adversarialOriginalStates:done.reduce((v,x)=>v+x.uniqueOriginalPhysicalStates,0),
  originalP0AlternativeActions:done.reduce((v,x)=>v+x.physicalP0Choices,0),
  originalForcedP1Replies:done.reduce((v,x)=>v+x.physicalP1Replies,0),
  originalTerminalDraws:done.reduce((v,x)=>v+x.drawEndpoints,0),
  P0FirstWins:done.reduce((v,x)=>v+x.p0FirstWins,0),
  P1FirstWins:done.reduce((v,x)=>v+x.p1FirstWins,0),
  guardNegativeControls:rejections.length};
 return {status:errors.length?'PHYSICAL_COUNTEREXAMPLE':
  incomplete.length?'BUDGETED_PHYSICAL_PARTIAL':'ALL_PHYSICAL_P0_ALTERNATIVES_DRAW',
  totals:total,errors,incomplete,
  resultsByK:Object.fromEntries([3,4,5,6].map(K=>[K,done.filter(x=>x.K===K).length])),
  maxFixtureStates:Math.max(0,...done.map(x=>x.uniqueOriginalPhysicalStates)),
  selectedCases:done.filter(x=>(x.W===8&&x.H===2&&x.K===3)||
   (x.W===6&&x.H===3&&x.K===4)||(x.W===7&&x.H===2&&x.K===4)||
   (x.W===5&&x.H===4&&x.K===5)).slice(0,16),
  testedNegativeGuards:rejections,
  sourceGameTreeVisits:0,sourceWDLQueries:0};
}
