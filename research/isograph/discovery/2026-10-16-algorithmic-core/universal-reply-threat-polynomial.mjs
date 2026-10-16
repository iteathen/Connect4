// Rule-derived, compact non-distributed *monotone Boolean polynomial*
// eliminating one P1 universal move quantifier for next-turn P0 wins.
//
// This module deliberately does NOT import/consult the masked reply fusion,
// a solved oracle, a winning policy, a continuation game tree, or a certificate.
// It derives a support-local formula from gravity + residual singleton
// geometry and applies the formula directly to the current q variables.
//
// Formula: (AND_i Y_i) AND (OR_{i<j} T_i*T_j
//                            OR OR_i T_i*U_i
//                            OR PRODUCT_i U_i).
// T_i: P0 has singleton residual at the current legal landing i.
// U_i: P0 has singleton residual at next landing above current i.
// Y_i: P1 lacks singleton residual at current legal landing i.
// O(width^2) symbolic monomials; no recursive child-state dependencies.

const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
export function createOneReplyThreatPolynomial({width:W,height:H,connect:K}) {
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
   throw Error('invalid finite board');
 const cell=(c,row)=>1n<<BigInt(row*W+c);
 const lines=new Map();
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of DIRS){
  if(c+(K-1)*dx<0||c+(K-1)*dx>=W||
     r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let x=0n;
  for(let j=0;j<K;j++)x|=cell(c+j*dx,r+j*dy);
  lines.set(String(x),x);
 }
 const basis=[...lines.values()],cache=new Map();
 function compile(h){
  if(!Array.isArray(h)||h.length!==W||
     h.some(v=>!Number.isInteger(v)||v<0||v>H))
    throw Error('invalid support');
  const key=h.join(','),old=cache.get(key);
  if(old)return old;
  let occupied=0n;
  for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)occupied|=cell(c,r);
  const shapeSet=new Set(basis.map(x=>String(x&~occupied)));
  const columns=[];
  for(let c=0;c<W;c++){
   if(h[c]>=H)continue;
   const t=cell(c,h[c]);
   const u=h[c]+1<H?cell(c,h[c]+1):null;
   columns.push({
    c,landing:t,upper:u,
    isP0LandingGeometricallyRelevant:shapeSet.has(String(t)),
    isUpperGeometricallyRelevant:u!==null&&shapeSet.has(String(u))
   });
  }
  if(columns.length===0)throw Error('P1 nonterminal state requires legal action');
  const pairTerms=[],relayTerms=[];
  for(let i=0;i<columns.length;i++){
   const ci=columns[i];
   for(let j=i+1;j<columns.length;j++){
    const cj=columns[j];
    if(ci.isP0LandingGeometricallyRelevant&&cj.isP0LandingGeometricallyRelevant)
      pairTerms.push([ci.c,cj.c]);
   }
   if(ci.isP0LandingGeometricallyRelevant&&ci.isUpperGeometricallyRelevant)
      relayTerms.push(ci.c);
  }
  const allowAllUpper=columns.every(col=>col.isUpperGeometricallyRelevant);
  const compiled=Object.freeze({
   h:h.slice(),rank:h.reduce((a,c)=>a+c,0),
   legalColumns:columns,
   guardColumns:columns.filter(x=>x.isP0LandingGeometricallyRelevant),
   pairTerms,relayTerms,allUpperTerm:allowAllUpper,
   symbolicTermCount:pairTerms.length+relayTerms.length+Number(allowAllUpper),
   symbolicInputVariableOccurrences:2*pairTerms.length+2*relayTerms.length+
     (allowAllUpper?columns.length:0)+columns.length,
   alternationFanoutExpanded:0,
   opponentChildStatesCompiled:0
  });
  cache.set(key,compiled);
  return compiled;
 }
 function evaluate(q,{metrics=null}={}){
  const f=compile(q.h);
  if((f.rank&1)!==1)throw Error('P1-mover predicate on wrong rank');
  const r0=new Set(q.R0.map(String)),r1=new Set(q.R1.map(String));
  let queries=0,operations=0;
  const T=new Map(),U=new Map();
  // P1 immediate winning actions: all must be ruled out.
  for(const x of f.legalColumns){
   queries++;if(r1.has(String(x.landing))){
    if(metrics){metrics.residualMembershipQueries=(metrics.residualMembershipQueries??0)+queries;
      metrics.termChecks=(metrics.termChecks??0)+operations;}
    return false;
   }
  }
  for(const x of f.legalColumns){
   queries++;T.set(x.c,x.isP0LandingGeometricallyRelevant&&r0.has(String(x.landing)));
   if(x.upper!==null){
    queries++;U.set(x.c,x.isUpperGeometricallyRelevant&&r0.has(String(x.upper)));
   }else U.set(x.c,false);
  }
  let pair=false,relay=false,allUpper=true;
  for(const [a,b] of f.pairTerms){
   operations++;if(T.get(a)&&T.get(b)){pair=true;break;}
  }
  if(!pair){
   for(const c of f.relayTerms){
    operations++;if(T.get(c)&&U.get(c)){relay=true;break;}
   }
  }
  if(!pair&&!relay){
   if(!f.allUpperTerm)allUpper=false;
   else for(const x of f.legalColumns){
    operations++;if(!U.get(x.c)){allUpper=false;break;}
   }
  }
  if(metrics){
   metrics.residualMembershipQueries=(metrics.residualMembershipQueries??0)+queries;
   metrics.termChecks=(metrics.termChecks??0)+operations;
  }
  return pair||relay||allUpper;
 }
 return Object.freeze({
  compile,evaluate,
  compiledSupportCount(){return cache.size;},
  proofDescription:'(AND all P1 immediate-win absence Y_i) AND (OR pair T_i*T_j OR relay T_i*U_i OR all-upper PRODUCT U_i); one universal reply layer eliminated by gravity'
 });
}
