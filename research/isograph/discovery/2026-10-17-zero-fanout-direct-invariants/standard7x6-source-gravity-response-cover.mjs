// Pure ORIGINAL q source-structural EXACT mate-in-three response-cover.
// NO future game q object; no strategic value/strategy tree evaluation.
// Theorem: docs/research/2026-10-17-source-gravity-response-cover-exact-mate-in-three.md
export function createSourceGravityResponseCover({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<2||K<2||
     K>Math.min(W,H)||W*H>42)throw Error('unsupported board');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxSourceMaskTests=25000}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(h=>!Number.isInteger(h)||h<0||h>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('requires first-win-stopped exact source q');
  const h=q.h,n=h.reduce((s,x)=>s+x,0),p=n&1,o=1-p;
  if(n>=N)throw Error('nonterminal source only');
  const own=p===0?q.R0:q.R1,opp=p===0?q.R1:q.R0;
  if([...own,...opp].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('invalid source generator');
  const O=new Set(own.map(String)),E=new Set(opp.map(String));
  const legal=h.flatMap((height,c)=>height<H?[c]:[]);
  const stats={sourceOriginalQInitializations:1,
   literalCurrentActionMaskScans:0,
   originalResidualMembershipChecks:0,
   staticOpponentColumnSetMembershipChecks:0,
   originalSourceFutureQStatesMaterialized:0,
   independentlyValuedStrategicFutureGames:0,
   independentOpponentRepliesSimulated:0,
   sourceBDDQBFStrategyTreesConstructed:0};
  function has(S,mask){stats.originalResidualMembershipChecks++;
   if(stats.originalResidualMembershipChecks>maxSourceMaskTests)throw Error('static proof guard exhausted');
   return S.has(String(mask));}
  const witnesses=[];
  for(const a of legal){
   stats.literalCurrentActionMaskScans++;
   const x=bit(a,h[a]);
   if(has(O,x)){
    witnesses.push({kind:'IMMEDIATE_OWNER_FIRST_WIN',literalAction:a+1,
      mover:p,proof:{landingCell:'0x'+x.toString(16)},originalSourceFutureValueQueries:0});
    continue;
   }
   if(n+1>=N)continue; // nonwinning full board DRAW is not a WIN
   const frontier=legal.flatMap(d=>{
    const r=h[d]+(d===a?1:0);
    return r<H?[{d,row:r,y:bit(d,r),z:r+1<H?bit(d,r+1):null}]:[];
   });
   if(!frontier.length)continue;
   // Source original opponent requirements are BLOCKED on x, not owner-contracted.
   if(frontier.some(v=>has(E,v.y)))continue;
   const S=[],Z=[],proofS={},proofZ={};
   for(const v of frontier){
    const srcY=[];
    if(has(O,v.y))srcY.push('0x'+v.y.toString(16));
    if(has(O,x|v.y))srcY.push('0x'+(x|v.y).toString(16));
    if(srcY.length){S.push(v.d+1);proofS[v.d+1]=srcY;}
    if(v.z!==null){
     const srcZ=[];
     if(has(O,v.z))srcZ.push('0x'+v.z.toString(16));
     if(has(O,x|v.z))srcZ.push('0x'+(x|v.z).toString(16));
     if(srcZ.length){Z.push(v.d+1);proofZ[v.d+1]=srcZ;}
    }
   }
   const D=frontier.map(v=>v.d+1);
   let kind=null;
   if(S.length>=2)kind='TWO_DISTINCT_CURRENT_WIN_TARGETS';
   else if(S.length===1&&Z.includes(S[0]))kind='SAME_COLUMN_STACKED_RELEASE';
   else if(S.length===0&&D.every(d=>Z.includes(d)))
     kind='ALL_OPPONENT_REPLIES_RELEASE_NEXT_WIN';
   if(!kind)continue;
   witnesses.push({
    kind,literalAction:a+1,mover:p,
    opponentLiteralReplyColumns:D,
    currentPlayableOwnerWinTargetColumns:S,
    opponentReplyReleaseOwnerWinTargetColumns:Z,
    sourceOriginalCurrentOwnerWitnesses:proofS,
    sourceOriginalReleasedOwnerWitnesses:proofZ,
    allOpponentImmediateWinsSourceDenied:true,
    allOpponentRepliesCoveredByStaticSetBoolean:true,
    originalSourceFutureValueQueries:0,
    proofType:'forall d in D: (S minus {d} nonempty) OR (d in Z)',
    replayOnlyForIndependentFalsification:true
   });
  }
  const order=['ALL_OPPONENT_REPLIES_RELEASE_NEXT_WIN',
   'SAME_COLUMN_STACKED_RELEASE','TWO_DISTINCT_CURRENT_WIN_TARGETS','IMMEDIATE_OWNER_FIRST_WIN'];
  const priority=kind=>order.indexOf(kind);
  const selected=witnesses.slice().sort((a,b)=>priority(a.kind)-priority(b.kind)||
    a.literalAction-b.literalAction)[0]??null;
  return {status:selected?'VALID_CONTINUATION':'INCOMPLETE',
    selectedOriginalLiteralColumn:selected?.literalAction??null,
    sourceCertificate:selected,
    sourceProvenWinActions:witnesses,
    sourceWitnessCounts:Object.fromEntries(order.map(k=>[k,witnesses.filter(w=>w.kind===k).length])),
    reason:selected?'SOURCE_GRAVITY_RESPONSE_COVER_NEXT_OWNER_TURN_WIN':'NO_SOURCE_MATE_IN_3_OR_IMMEDIATE_CERTIFICATE',
    statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
