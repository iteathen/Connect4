// INDEPENDENT original7x6 PHYSICAL opponent-policy guard necessity control.
// Frozen before running. Testing whether SOURCE-proved o forced WIN by one
// gravity-safe pairing is STRONGER than naked dual overloaded future turns:
// could p still POSSIBLY win if o makes a mistake (hence pair policy matters)?
// Enumerates physical suffixes as validation ONLY, never source evaluator.
// Sample named positive histories independently frozen in source proof.
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),inc=Array.from({length:N},()=>[]);
let lines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+j*dr)*W+c+j*dc;mask|=bit(c+j*dc,r+j*dr);ids.push(id);}
  for(const id of ids)inc[id].push(mask);lines++;
 }
if(lines!==69)throw Error('incorrect original physical geometry');
const blank=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,result:null});
const legal=q=>q.h.flatMap((h,c)=>h<H?[c]:[]);
function next(q,c){
 if(q.result!==null||q.h[c]>=H)throw Error('illegal first-win physical');
 const p=q.n&1,r=q.h[c],id=r*W+c,h=q.h.slice(),P=q.P.slice();h[c]++;P[p]|=bit(c,r);
 const won=inc[id].some(m=>(P[p]&m)===m);
 return {h,P,n:q.n+1,result:won?(p===0?1:-1):q.n+1===N?0:null};
}
const positiveHistories=[
 "7654253275136145236326217611177672",
 "41674362237752476413243476111375532156",
 "72451616643612244562657277723154174515",
 "71244731641317732632666351437217265424",
 "33172467641516575153416321657454743367",
 "661435431127725717426245331565343714"
];
const result={
 schema:'connect4.standard7x6.opponent_pair_policy_guard_needed_for_dual_win_v0_1',
 resultType:'INDEPENDENT_PHYSICAL_CONTINGENCY_FALSIFIER_NOT_SOURCE_WIN_ALGORITHM',
 originalBoard:{W,H,K,lines},histories:[],
 physicalTerminalSuffixBranchesEnumerated:0,physicalIntermediateStatesChecked:0,
 demonstratedNontrivialPolicyDependence:null,
 noPreviousWinnerGuardFailures:0
};
for(const history of positiveHistories){
 let q=blank();
 for(const c of history){q=next(q,Number(c)-1);if(q.result!==null)throw Error('positive source history already first terminal');}
 const p=q.n&1,o=1-p,byOutcome={pWin:0,oWin:0,draw:0},witness={pWin:null,oWin:null,draw:null};
 // No memo: need an actual physical legal first-win suffix witness.
 function dfs(node,word){
  result.physicalIntermediateStatesChecked++;
  if(node.result!==null){
   result.physicalTerminalSuffixBranchesEnumerated++;
   let cat=node.result===0?'draw':node.result===(p===0?1:-1)?'pWin':'oWin';
   byOutcome[cat]++;
   if(witness[cat]===null)witness[cat]=word;
   return;
  }
  for(const c of legal(node))dfs(next(node,c),word+String(c+1));
 }
 dfs(q,'');
 const record={history,ply:q.n,mover:p,opponent:o,
  legalOriginalFirstActions:legal(q).map(c=>c+1),
  possibleFirstTerminalOutcomePaths:byOutcome,
  shortestStoredConcreteContinuationToEachOutcome:witness};
 result.histories.push(record);
 if(!result.demonstratedNontrivialPolicyDependence&&byOutcome.pWin>0&&byOutcome.oWin>0)
  result.demonstratedNontrivialPolicyDependence=record;
}
console.log(JSON.stringify(result,null,2));
