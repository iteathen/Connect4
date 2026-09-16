#!/usr/bin/env node

// Reference direct line-product BSFP using exact support-local realizability
// completion. Small controls use u32 masks only as a qualification backend.
// The recurrence itself operates on line-hit boundary pairs and does not
// enumerate ownership assignments. Ownership enumeration appears only in the
// independent product-boundary authority at the end of the qualifier.

function pc(m){m>>>=0;let c=0;while(m){m&=m-1;c++;}return c}
function sub(a,b){return (a&~b)===0}
function bits(m,f){m>>>=0;let i=0;while(m){if(m&1)f(i);m>>>=1;i++}}
function normMinMasks(xs){const a=[...new Set(xs.map(x=>x>>>0))].sort((x,y)=>pc(x)-pc(y)||x-y),r=[];outer:for(const x of a){for(const y of r)if(sub(y,x))continue outer;r.push(x)}return r}
function normMaxMasks(xs){const a=[...new Set(xs.map(x=>x>>>0))].sort((x,y)=>pc(y)-pc(x)||x-y),r=[];outer:for(const x of a){for(const y of r)if(sub(x,y))continue outer;r.push(x)}return r}
function lines(W,H,K){const o=[],idx=(c,r)=>r*W+c;for(let r=0;r<H;r++)for(let c=0;c<=W-K;c++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r);o.push(m>>>0)}for(let c=0;c<W;c++)for(let r=0;r<=H-K;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c,r+i);o.push(m>>>0)}for(let c=0;c<=W-K;c++)for(let r=0;r<=H-K;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r+i);o.push(m>>>0)}for(let c=0;c<=W-K;c++)for(let r=K-1;r<H;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r-i);o.push(m>>>0)}return o}
function supports(W,H){const h=Array(W).fill(0),o=[];function rec(c){if(c===W){let U=0,rank=0;for(let x=0;x<W;x++)for(let y=0;y<h[x];y++){U|=1<<(y*W+x);rank++}o.push({h:[...h],U:U>>>0,rank,key:h.join(',')});return}for(let v=0;v<=H;v++){h[c]=v;rec(c+1)}}rec(0);return o}
function prep(W,H,K){const LS=lines(W,H,K),incCells=Array.from({length:W*H},()=>0),incLines=Array.from({length:W*H},()=>[]);for(let i=0;i<LS.length;i++)bits(LS[i],x=>{incCells[x]|=1<<i;incLines[x].push(i)});const S=supports(W,H),byKey=new Map(S.map((s,i)=>[s.key,i])),byRank=Array.from({length:W*H+1},()=>[]);S.forEach((s,i)=>byRank[s.rank].push(i));return{LS,incCells,incLines,S,byKey,byRank,allLineBits:LS.length===32?0xffffffff:((1<<LS.length)-1)>>>0}}
function hitPair(U,p0,LS){const p1=(U&~p0)>>>0;let h0=0,h1=0;for(let i=0;i<LS.length;i++){const occ=LS[i]&U;if(occ&p0)h0|=1<<i;if(occ&p1)h1|=1<<i}return{h0:h0>>>0,h1:h1>>>0}}
function rel(q,p){return p===0?{own:q.h0,opp:q.h1}:{own:q.h1,opp:q.h0}}
function leP(a,b,p){const A=rel(a,p),B=rel(b,p);return sub(A.own,B.own)&&sub(B.opp,A.opp)}
function pairKey(q){return q.h0+','+q.h1}
function normPairs(qs,p){const unique=new Map();for(const q of qs)unique.set(pairKey(q),q);const r=[];outer:for(const q of unique.values()){for(let i=r.length-1;i>=0;i--){const x=r[i];if(leP(x,q,p))continue outer;if(leP(q,x,p))r.splice(i,1)}r.push(q)}return r.sort((a,b)=>a.h0-b.h0||a.h1-b.h1)}
function minTransversals(forced,clauses){let F=[forced>>>0];for(const C of clauses){const next=[];for(const b of F){if(b&C){next.push(b);continue}bits(C,i=>next.push((b|(1<<i))>>>0))}F=normMinMasks(next)}return F}

function createCompleter(P,stats){
  const cache=new Map();
  return function complete(s,p,ownReq,oppAllowed){
    const ck=s.key+'|'+p+'|'+ownReq+'|'+oppAllowed;
    if(cache.has(ck))return cache.get(ck);
    stats.completionCalls++;
    const occ=P.LS.map(l=>(l&s.U)>>>0);
    let forced=0;
    for(let i=0;i<P.LS.length;i++)if((oppAllowed&(1<<i))===0)forced|=occ[i];
    const clauses=[];
    for(let i=0;i<P.LS.length;i++)if(ownReq&(1<<i)){
      if(occ[i]===0){cache.set(ck,[]);return[]}
      if((forced&occ[i])===0)clauses.push(occ[i]);
    }
    const owners=minTransversals(forced>>>0,clauses),pairs=[];
    for(const ownP of owners){const p0=p===0?ownP>>>0:(s.U&~ownP)>>>0;pairs.push(hitPair(s.U,p0,P.LS))}
    const out=normPairs(pairs,p);
    stats.completionOutputs+=out.length;
    stats.maxCompletion=Math.max(stats.maxCompletion,out.length);
    cache.set(ck,out);
    return out;
  }
}

function unionP(A,B,p){return normPairs([...A,...B],p)}
function intersectP(A,B,p,s,complete,stats){if(!A.length||!B.length)return[];const out=[];for(const a of A)for(const b of B){stats.productPairs++;const ar=rel(a,p),br=rel(b,p);out.push(...complete(s,p,(ar.own|br.own)>>>0,(ar.opp&br.opp)>>>0))}return normPairs(out,p)}
function preimageFamily(childF,p,mover,s,x,P,complete){const Ix=P.incCells[x],out=[];for(const q of childF){const r=rel(q,p);if(mover===p)out.push(...complete(s,p,(r.own&~Ix)>>>0,r.opp));else{if((Ix&~r.opp)!==0)continue;out.push(...complete(s,p,r.own,r.opp))}}return normPairs(out,p)}
function terminalFamilies(s,mover,x,P,complete){const terminal=[],opponentBlockers=[];for(const li of P.incLines[x]){const other=(P.LS[li]&~(1<<x))>>>0;if(!sub(other,s.U))continue;terminal.push(...complete(s,mover,0,(P.allLineBits&~(1<<li))>>>0));const opp=1-mover;opponentBlockers.push(complete(s,opp,(1<<li)>>>0,P.allLineBits))}return{terminal:normPairs(terminal,mover),opponentBlockers}}

function solveProduct(W,H,K){
  const P=prep(W,H,K),F=Array(P.S.length),stats={completionCalls:0,completionOutputs:0,maxCompletion:0,productPairs:0};
  const complete=createCompleter(P,stats);
  for(let rank=W*H;rank>=0;rank--){const mover=rank&1;for(const si of P.byRank[rank]){const s=P.S[si];let A0=null,A1=null;for(let c=0;c<W;c++){const row=s.h[c];if(row>=H)continue;const ch=[...s.h];ch[c]++;const child=F[P.byKey.get(ch.join(','))],x=row*W+c;let w0=preimageFamily(child.w0,0,mover,s,x,P,complete),w1=preimageFamily(child.w1,1,mover,s,x,P,complete);const term=terminalFamilies(s,mover,x,P,complete);if(term.terminal.length){if(mover===0)w0=unionP(w0,term.terminal,0);else w1=unionP(w1,term.terminal,1);for(const blocker of term.opponentBlockers){if(mover===0)w1=intersectP(w1,blocker,1,s,complete,stats);else w0=intersectP(w0,blocker,0,s,complete,stats)}}if(A0===null){A0=w0;A1=w1}else if(mover===0){A0=unionP(A0,w0,0);A1=intersectP(A1,w1,1,s,complete,stats)}else{A0=intersectP(A0,w0,0,s,complete,stats);A1=unionP(A1,w1,1)}}F[si]={w0:A0??[],w1:A1??[]}}}
  return{...P,F,stats};
}

// Ownership-antichain authority. It is not used by the direct product recurrence.
function cofUp(F,x,m){const b=1<<x,r=[];if(m===0){for(const a of F)r.push((a&~b)>>>0)}else for(const a of F)if(!(a&b))r.push(a);return normMinMasks(r)}
function cofDn(F,x,m){const b=1<<x,r=[];if(m===0){for(const a of F)if(a&b)r.push((a&~b)>>>0)}else for(const a of F)r.push((a&~b)>>>0);return normMaxMasks(r)}
function intUp(A,B){const r=[];for(const a of A)for(const b of B)r.push((a|b)>>>0);return normMinMasks(r)}
function intDn(A,B){const r=[];for(const a of A)for(const b of B)r.push((a&b)>>>0);return normMaxMasks(r)}
function subUpDn(D,F){const out=[];for(const cap of D){let cs=[cap];for(const q of F){const nx=[];for(const c of cs){if(!sub(q,c)){nx.push(c);continue}bits(q,i=>nx.push((c&~(1<<i))>>>0))}cs=normMaxMasks(nx)}out.push(...cs)}return normMaxMasks(out)}
function subDnUp(U,F,univ){const out=[];for(const base of U){let cs=[base];for(const q of F){const nx=[];for(const c of cs){if(!sub(c,q)){nx.push(c);continue}bits(univ&~q,i=>nx.push((c|(1<<i))>>>0))}cs=normMinMasks(nx)}out.push(...cs)}return normMinMasks(out)}
function solveOwnership(W,H,K){const P=prep(W,H,K),F=Array(P.S.length);for(let rank=W*H;rank>=0;rank--){const mover=rank&1;for(const si of P.byRank[rank]){const s=P.S[si];let AW=null,AL=null;for(let c=0;c<W;c++){const row=s.h[c];if(row>=H)continue;const ch=[...s.h];ch[c]++;const child=F[P.byKey.get(ch.join(','))],x=row*W+c;let w=cofUp(child.w,x,mover),l=cofDn(child.l,x,mover);if(mover===0){const ts=[];for(const li of P.incLines[x]){const q=(P.LS[li]&~(1<<x))>>>0;if(sub(q,s.U))ts.push(q)}const T=normMinMasks(ts);if(T.length){l=subUpDn(l,T);w=normMinMasks([...w,...T])}}else{const ts=[];for(const li of P.incLines[x]){const q=(P.LS[li]&~(1<<x))>>>0;if(sub(q,s.U))ts.push((s.U&~q)>>>0)}const T=normMaxMasks(ts);if(T.length){w=subDnUp(w,T,s.U);l=normMaxMasks([...l,...T])}}if(AW===null){AW=w;AL=l}else if(mover===0){AW=normMinMasks([...AW,...w]);AL=intDn(AL,l)}else{AW=intUp(AW,w);AL=normMaxMasks([...AL,...l])}}F[si]={w:AW??[],l:AL??[]}}}return{...P,F}}
function classify(frontier,p0){const w=frontier.w.some(g=>sub(g,p0)),l=frontier.l.some(c=>sub(p0,c));if(w&&l)throw new Error('authority frontier overlap');return w?1:l?-1:0}
function authorityProduct(B,si,p){const s=B.S[si],cells=[];bits(s.U,i=>cells.push(i));const n=1<<cells.length,qs=[];for(let local=0;local<n;local++){let p0=0;for(let i=0;i<cells.length;i++)if(local&(1<<i))p0|=1<<cells[i];const v=classify(B.F[si],p0>>>0);if((p===0&&v===1)||(p===1&&v===-1))qs.push(hitPair(s.U,p0>>>0,B.LS))}return normPairs(qs,p)}
function same(A,B){if(A.length!==B.length)return false;const a=[...A].sort((x,y)=>x.h0-y.h0||x.h1-y.h1),b=[...B].sort((x,y)=>x.h0-y.h0||x.h1-y.h1);return a.every((q,i)=>q.h0===b[i].h0&&q.h1===b[i].h1)}
function compare(W,H,K){const O=solveOwnership(W,H,K),Q=solveProduct(W,H,K);let w0Mismatches=0,w1Mismatches=0;for(let si=0;si<O.S.length;si++){if(!same(authorityProduct(O,si,0),Q.F[si].w0))w0Mismatches++;if(!same(authorityProduct(O,si,1),Q.F[si].w1))w1Mismatches++}return{columns:W,rows:H,connect:K,supports:O.S.length,w0Mismatches,w1Mismatches,stats:Q.stats}}

const [W,H,K]=process.argv.slice(2).map(Number);
const result=compare(W,H,K);
if(result.w0Mismatches||result.w1Mismatches)process.exitCode=1;
process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
