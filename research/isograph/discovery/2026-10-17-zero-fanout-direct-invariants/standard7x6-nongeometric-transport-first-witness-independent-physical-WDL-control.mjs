// FROZEN BEFORE independent TRUE ORIGINAL 7x6 physical minimax control.
// Source-first weak WDL J_2<=J_7 after history below via complete
// capacity-preserving but NON-GEOMETRIC column map [1,5,6,4,7,2,3].
// Physical validator deliberately uses NO source-q, source mask, or
// transport solver. Its recursion is REFERENCE ONLY, not source proof.
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
const history='1555271171452354215737327342666366';
const sourceCertified={lowerP0RelativeOriginalLiteralAction:2,
 upperP0RelativeOriginalLiteralAction:7,
 sourceOneBasedWholeColumnMapping:[1,5,6,4,7,2,3],
 sourceFirstWinStoppedRank:34,
 sourceExpectedHeights:[5,5,5,3,6,5,5]};
const incidence=Array.from({length:N},()=>[]);let winlineCount=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let mask=0n,ids=[];
  for(let k=0;k<K;k++){
   const id=(r+k*dy)*W+c+k*dx;mask|=bit(c+k*dx,r+k*dy);ids.push(id);
  }
  for(const id of ids)incidence[id].push(mask);
  winlineCount++;
 }
if(winlineCount!==69)throw Error('independent physical 7x6 has wrong 69 K-lines');
function initial(){return {h:Array(W).fill(0),P:[0n,0n],n:0,terminal:null,history:''};}
function legal(s){return s.h.flatMap((r,c)=>r<H?[c]:[]);}
function step(s,c){
 if(s.terminal!==null||!Number.isInteger(c)||c<0||c>=W||s.h[c]>=H)
  throw Error('physical invalid gravity or move after first terminal');
 const p=s.n&1,r=s.h[c],id=r*W+c,h=s.h.slice(),P=s.P.slice();
 h[c]++;P[p]|=bit(c,r);
 const win=incidence[id].some(G=>(P[p]&G)===G);
 return {h,P,n:s.n+1,terminal:win?(p===0?1:-1):s.n+1===N?0:null,
  history:s.history+String(c+1)};
}
const memo=new Map(),stats={
 schema:'connect4.true7x6.nongeometric_source_transport_first_witness_independent_physical_WDL_v0_1',
 rank:null,originalCurrentMover:null,originalHeights:null,legalFirstActions:[],
 physicalKLines:winlineCount,physicalTerminalShortCircuitChecks:0,
 fullRecursiveRootValueCalls:0,physicalReferenceStates:0,
 physicalActionWDLExactValues:[],
 sourceWeakWdlInequalityPhysicallyVerified:false,
 sourceWeakWdlInequalityStrict:false,
 sourceUpperP0ValueActionActuallyBest:false,
 sourceLegacyProofWasNeededForBestAction:false,
 anyOriginalIllegalGravityOrEarlyFirstWin:false
};
function key(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function WDL(s){
 stats.fullRecursiveRootValueCalls++;
 if(s.terminal!==null)return s.terminal;
 const k=key(s);if(memo.has(k))return memo.get(k);
 stats.physicalReferenceStates++;
 let v=(s.n&1)?1:-1;
 for(const c of legal(s)){
  const val=WDL(step(s,c));v=(s.n&1)?Math.min(v,val):Math.max(v,val);
 }
 memo.set(k,v);return v;
}
let root=initial();
for(const digit of history){
 root=step(root,Number(digit)-1);
 stats.physicalTerminalShortCircuitChecks++;
 if(root.terminal!==null)throw Error('frozen source history ended at an earlier ORIGINAL K first win');
}
if(root.n!==sourceCertified.sourceFirstWinStoppedRank||
 root.h.join(',')!==sourceCertified.sourceExpectedHeights.join(','))
 throw Error('source witness physical heights mismatch');
stats.rank=root.n;stats.originalCurrentMover=root.n&1;stats.originalHeights=root.h;
stats.legalFirstActions=legal(root).map(c=>c+1);
stats.physicalActionWDLExactValues=legal(root).map(c=>({
 literalOriginalColumn:c+1,
 firstActionP0RelativePerfectWDL:WDL(step(root,c))
}));
const actualMap=new Map(stats.physicalActionWDLExactValues.map(z=>[
 z.literalOriginalColumn,z.firstActionP0RelativePerfectWDL]));
const lower=actualMap.get(sourceCertified.lowerP0RelativeOriginalLiteralAction),
 upper=actualMap.get(sourceCertified.upperP0RelativeOriginalLiteralAction);
stats.sourceWeakWdlInequalityPhysicallyVerified=lower<=upper;
stats.sourceWeakWdlInequalityStrict=lower<upper;
const V=root.n%2===0?Math.max(...actualMap.values()):Math.min(...actualMap.values());
stats.ordinaryRootP0RelativePerfectValue=V;
stats.actualLevel2BestOriginalLiteralActions=stats.physicalActionWDLExactValues.filter(z=>
 z.firstActionP0RelativePerfectWDL===V).map(z=>z.literalOriginalColumn);
stats.sourceUpperP0ValueActionActuallyBest=upper===V;
stats.sourceLegacyProofWasNeededForBestAction=stats.actualLevel2BestOriginalLiteralActions.length>0&&
 stats.actualLevel2BestOriginalLiteralActions.includes(sourceCertified.upperP0RelativeOriginalLiteralAction);
stats.sourceStructuralWeakOrderClaim=sourceCertified;
if(!stats.sourceWeakWdlInequalityPhysicallyVerified)
 throw Error('source certified J2<=J7 REFUTED by independent actual7x6 physical minimax');
console.log(JSON.stringify(stats,null,2));
