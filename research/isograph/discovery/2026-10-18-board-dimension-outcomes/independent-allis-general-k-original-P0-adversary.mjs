// INDEPENDENT original-grid physical falsifier of a FROZEN GENERAL-K
// Allis-style P1 defender. P0 branching below is VALIDATOR-only, never
// mathematical source WDL search. Preserves first-win stopping, actual
// gravity and four directional K-line incidence.
import {createGeneralKCentralSecondNonWin} from './source-allis-general-k-two-center-response.mjs';
const DS=[[1,0],[0,1],[1,1],[1,-1]];
function build(W,H,K){
 const L=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DS){
  const ex=x+(K-1)*dx,ey=y+(K-1)*dy;
  if(ex<0||ex>=W||ey<0||ey>=H)continue;
  let mask=0n;
  for(let i=0;i<K;i++)mask|=1n<<BigInt((y+i*dy)*W+x+i*dx);
  L.push(mask);
 }
 const inc=Array.from({length:W*H},()=>[]);
 L.forEach(mask=>{
  for(let i=0;i<W*H;i++)if(mask&(1n<<BigInt(i)))inc[i].push(mask);
 });
 return {lines:L,inc};
}
function originalPlace(s,c,p,W,H,inc){
 const h=s.h;
 if(c<0||c>=W||h[c]>=H)throw Error('PHYSICAL_ILLEGAL_MATE_OR_ACTION');
 const z=h[c]*W+c,mask=1n<<BigInt(z);
 if(((s.p0|s.p1)&mask)!==0n)throw Error('PHYSICAL_CELL_DOUBLE_OWNED');
 const own=p===0?s.p0|mask:s.p1|mask;
 const win=inc[z].some(m=>(own&m)===m);
 const nh=h.slice();nh[c]++;
 return {newState:{h:nh,p0:p===0?own:s.p0,p1:p===1?own:s.p1},
  row:h[c],win,full:nh.every(x=>x===H)};
}
function structuralCampaign(W,H,K,maxStates){
 const P=createGeneralKCentralSecondNonWin({width:W,height:H,connect:K});
 const {lines,inc}=build(W,H,K),S={W,H,K,originalWinlines:lines.length,
  states:0,P0Actions:0,P1Replies:0,P1FirstWins:0,drawEnds:0,P0FirstWins:0,
  incomplete:false},memo=new Set();
 function visit(s){
  const key=s.h.join(',')+'|'+s.p0.toString(16)+'|'+s.p1.toString(16);
  if(memo.has(key))return;
  memo.add(key);S.states++;
  if(S.states>maxStates){S.incomplete=true;throw Error('INDEPENDENT_PHYSICAL_STATE_BUDGET')}
  for(let a=0;a<W;a++){
   if(s.h[a]>=H)continue;
   S.P0Actions++;
   const move=originalPlace(s,a,0,W,H,inc);
   if(move.win){S.P0FirstWins++;throw Error('P0_FIRST_WIN_BEFORE_P1_POLICY_RESPONSE')}
   if(move.full)throw Error('even area cannot fill immediately on P0 move');
   const ans=P.reply({heightsBeforeP0:s.h,p0Column:a});
   const b=ans.originalP1Column;
   const reply=originalPlace(move.newState,b,1,W,H,inc);
   if(reply.row!==ans.originalP1Row||move.row!==ans.originalP0Row)
    throw Error('ORIGINAL_PHYSICAL_SOURCE_ROW_INCONSISTENCY');
   S.P1Replies++;
   if(reply.win){S.P1FirstWins++;continue;}
   if(reply.full){S.drawEnds++;continue;}
   visit(reply.newState);
  }
 }
 try{visit({h:Array(W).fill(0),p0:0n,p1:0n})}
 catch(e){if(String(e).includes('PHYSICAL_STATE_BUDGET'))return {status:'INCOMPLETE_PHYSICAL_BUDGET',...S};
  throw e}
 return {status:'COMPLETE_ALL_P0_ALTERNATIVES_P1_NONWIN',...S};
}
function sampleCampaign(W,H,K,samples,seed){
 const P=createGeneralKCentralSecondNonWin({width:W,height:H,connect:K});
 const {lines,inc}=build(W,H,K),S={W,H,K,originalWinlines:lines.length,
  sampleGames:0,P0Actions:0,P1Replies:0,P1FirstWins:0,drawEnds:0,P0FirstWins:0,
  sourceFutureWDLQueries:0};
 let rng=seed>>>0;
 const rand=n=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return ((rng>>>8)%n)};
 for(let t=0;t<samples;t++){
  let s={h:Array(W).fill(0),p0:0n,p1:0n};
  while(true){
   const legal=s.h.flatMap((x,c)=>x<H?[c]:[]);
   if(!legal.length)throw Error('no moves but not terminated');
   const a=legal[rand(legal.length)];
   const move=originalPlace(s,a,0,W,H,inc);S.P0Actions++;
   if(move.win){S.P0FirstWins++;throw Error('P0_FIRST_WIN_UNDER_SOURCE_POLICY')}
   if(move.full)throw Error('unexpected P0 final move');
   const ans=P.reply({heightsBeforeP0:s.h,p0Column:a});
   const reply=originalPlace(move.newState,ans.originalP1Column,1,W,H,inc);
   if(reply.row!==ans.originalP1Row)throw Error('mate physical row mismatch');
   S.P1Replies++;
   if(reply.win){S.P1FirstWins++;break}
   if(reply.full){S.drawEnds++;break}
   s=reply.newState;
  }
  S.sampleGames++;
 }
 return S;
}
export function independentAllisGeneralKCampaign(){
 const frozen=[],incomplete=[],failures=[],samples=[],negative=[];
 for(const [K,W,H] of [
  [4,4,2],[4,5,2],[4,6,2],
  [4,4,4],[4,5,4],[4,6,4],
  [4,4,6],[4,5,6],[4,6,6],
  [5,5,4],[5,6,4],[5,7,4],[5,8,4],
  [5,5,6],[5,6,6],[6,6,4],[6,8,4]
 ]) {
  try{
   const p=structuralCampaign(W,H,K,175000);
   if(p.status==='INCOMPLETE_PHYSICAL_BUDGET')incomplete.push(p);
   else frozen.push(p);
  }catch(e){failures.push({W,H,K,error:String(e)})}
 }
 for(const K of [4,5,6])for(let W=K;W<=2*K-2;W++)for(const H of [2,4,6,8]){
  try{samples.push(sampleCampaign(W,H,K,250,20261018+1000*K+100*W+H))}
  catch(e){failures.push({W,H,K,kind:'SAMPLE_FAILED',error:String(e)})}
 }
 for(const [W,H,K] of [[7,6,4],[6,5,4],[4,4,3],[9,6,5],[3,6,4]]){
  try{createGeneralKCentralSecondNonWin({width:W,height:H,connect:K});
   failures.push({W,H,K,kind:'INVALID_GUARD_ACCEPTED'})}
  catch(e){negative.push({W,H,K,guardRejected:true})}
 }
 const sum=(arr,k)=>arr.reduce((s,x)=>s+(x[k]??0),0);
 return {status:failures.length?'FALSIFIED':
  incomplete.length?'INTERNAL_PHYSICAL_COMPLETE_SUBSET_AND_BUDGETED_CASES':'ALL_PHYSICAL_CHECKS_PASS',
  completeFixtures:frozen.length,incompleteFixtures:incomplete.length,
  adversarialOriginalStates:sum(frozen,'states'),
  exhaustiveP0Alternatives:sum(frozen,'P0Actions'),
  exhaustiveP1Replies:sum(frozen,'P1Replies'),
  sampledGames:sum(samples,'sampleGames'),
  sampledOriginalP0Actions:sum(samples,'P0Actions'),
  sampledOriginalP1Replies:sum(samples,'P1Replies'),
  sampledP1FirstWins:sum(samples,'P1FirstWins'),
  sampledFullDraws:sum(samples,'drawEnds'),
  P0FirstWins:sum(frozen,'P0FirstWins')+sum(samples,'P0FirstWins'),
  errors:failures,
  incompleteFixturesDetails:incomplete.map(x=>({W:x.W,H:x.H,K:x.K,states:x.states})),
  perKSampleGames:Object.fromEntries([4,5,6].map(K=>[K,sum(samples.filter(x=>x.K===K),'sampleGames')])),
  negativeGuards:negative,
  sampleFixtures:samples.length,
  sourceGameStateWDLValuesComputed:0,
  independentPhysicalBranchingIsValidationOnly:true};
}
