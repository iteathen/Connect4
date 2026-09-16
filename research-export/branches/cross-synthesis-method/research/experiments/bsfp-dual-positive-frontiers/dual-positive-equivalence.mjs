#!/usr/bin/env node

// Differential qualification of the geometry-generic dual-positive BSFP form.
// Small controls use u32 masks only as an exhaustive test representation.

function pc(m){m>>>=0;let c=0;while(m){m&=m-1;c++;}return c}
function subset(a,b){return (a&~b)===0}
function bits(m,f){m>>>=0;let i=0;while(m){if(m&1)f(i);m>>>=1;i++}}
function minNorm(xs){const a=[...new Set(xs.map(x=>x>>>0))].sort((x,y)=>pc(x)-pc(y)||x-y),r=[];outer:for(const x of a){for(const y of r)if(subset(y,x))continue outer;r.push(x)}return r}
function maxNorm(xs){const a=[...new Set(xs.map(x=>x>>>0))].sort((x,y)=>pc(y)-pc(x)||x-y),r=[];outer:for(const x of a){for(const y of r)if(subset(x,y))continue outer;r.push(x)}return r}

function lineMasks(W,H,K){const out=[],idx=(c,r)=>r*W+c;for(let r=0;r<H;r++)for(let c=0;c<=W-K;c++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r);out.push(m>>>0)}for(let c=0;c<W;c++)for(let r=0;r<=H-K;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c,r+i);out.push(m>>>0)}for(let c=0;c<=W-K;c++)for(let r=0;r<=H-K;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r+i);out.push(m>>>0)}for(let c=0;c<=W-K;c++)for(let r=K-1;r<H;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r-i);out.push(m>>>0)}return out}
function supports(W,H){const h=Array(W).fill(0),out=[];function rec(c){if(c===W){let U=0,rank=0;for(let x=0;x<W;x++)for(let y=0;y<h[x];y++){U|=1<<(y*W+x);rank++}out.push({h:[...h],U:U>>>0,rank,key:h.join(',')});return}for(let v=0;v<=H;v++){h[c]=v;rec(c+1)}}rec(0);return out}
function prep(W,H,K){const ls=lineMasks(W,H,K),inc=Array.from({length:W*H},()=>[]);for(const m of ls)bits(m,i=>inc[i].push(m));const S=supports(W,H),byKey=new Map(S.map((s,i)=>[s.key,i])),byRank=Array.from({length:W*H+1},()=>[]);S.forEach((s,i)=>byRank[s.rank].push(i));return{inc,S,byKey,byRank}}

function cofUp(F,x,m){const b=1<<x,r=[];if(m===0){for(const a of F)r.push((a&~b)>>>0)}else for(const a of F)if(!(a&b))r.push(a);return minNorm(r)}
function cofDown(F,x,m){const b=1<<x,r=[];if(m===0){for(const a of F)if(a&b)r.push((a&~b)>>>0)}else for(const a of F)r.push((a&~b)>>>0);return maxNorm(r)}
function positiveCof(F,x,m,p){const b=1<<x,r=[];if(m===p){for(const a of F)r.push((a&~b)>>>0)}else for(const a of F)if(!(a&b))r.push(a);return minNorm(r)}
function intersectUp(A,B){const r=[];for(const a of A)for(const b of B)r.push((a|b)>>>0);return minNorm(r)}
function intersectDown(A,B){const r=[];for(const a of A)for(const b of B)r.push((a&b)>>>0);return maxNorm(r)}

function subtractUpFromDown(D,F){if(!D.length||!F.length)return [...D];const out=[];for(const cap of D){let cs=[cap];for(const q of F){const nx=[];for(const c of cs){if(!subset(q,c)){nx.push(c);continue}bits(q,i=>nx.push((c&~(1<<i))>>>0))}cs=maxNorm(nx);if(!cs.length)break}out.push(...cs)}return maxNorm(out)}
function subtractDownFromUp(U,F,univ){if(!U.length||!F.length)return [...U];const out=[];for(const base of U){let cs=[base];for(const q of F){const nx=[];for(const c of cs){if(!subset(c,q)){nx.push(c);continue}bits(univ&~q,i=>nx.push((c|(1<<i))>>>0))}cs=minNorm(nx);if(!cs.length)break}out.push(...cs)}return minNorm(out)}
function blockerFamily(q){const r=[];bits(q,i=>r.push((1<<i)>>>0));return minNorm(r)}

function baseline(W,H,K){const P=prep(W,H,K),F=Array(P.S.length);for(let rank=W*H;rank>=0;rank--){const mover=rank&1;for(const si of P.byRank[rank]){const s=P.S[si];let AW=null,AL=null;for(let col=0;col<W;col++){const row=s.h[col];if(row>=H)continue;const ch=[...s.h];ch[col]++;const child=F[P.byKey.get(ch.join(','))],x=row*W+col;let w=cofUp(child.w,x,mover),l=cofDown(child.l,x,mover);if(mover===0){const ts=[];for(const lm of P.inc[x]){const q=(lm&~(1<<x))>>>0;if(subset(q,s.U))ts.push(q)}const T=minNorm(ts);if(T.length){l=subtractUpFromDown(l,T);w=minNorm([...w,...T])}}else{const ts=[];for(const lm of P.inc[x]){const q=(lm&~(1<<x))>>>0;if(subset(q,s.U))ts.push((s.U&~q)>>>0)}const T=maxNorm(ts);if(T.length){w=subtractDownFromUp(w,T,s.U);l=maxNorm([...l,...T])}}if(AW===null){AW=w;AL=l}else if(mover===0){AW=minNorm([...AW,...w]);AL=intersectDown(AL,l)}else{AW=intersectUp(AW,w);AL=maxNorm([...AL,...l])}}F[si]={w:AW??[],l:AL??[]}}}return{...P,F}}

function dual(W,H,K){const P=prep(W,H,K),F=Array(P.S.length);for(let rank=W*H;rank>=0;rank--){const mover=rank&1;for(const si of P.byRank[rank]){const s=P.S[si];let A0=null,A1=null;for(let col=0;col<W;col++){const row=s.h[col];if(row>=H)continue;const ch=[...s.h];ch[col]++;const child=F[P.byKey.get(ch.join(','))],x=row*W+col;let w0=positiveCof(child.w0,x,mover,0),w1=positiveCof(child.w1,x,mover,1);const qs=[];for(const lm of P.inc[x]){const q=(lm&~(1<<x))>>>0;if(subset(q,s.U))qs.push(q)}if(qs.length){if(mover===0){w0=minNorm([...w0,...qs]);for(const q of qs)w1=intersectUp(w1,blockerFamily(q))}else{w1=minNorm([...w1,...qs]);for(const q of qs)w0=intersectUp(w0,blockerFamily(q))}}if(A0===null){A0=w0;A1=w1}else if(mover===0){A0=minNorm([...A0,...w0]);A1=intersectUp(A1,w1)}else{A0=intersectUp(A0,w0);A1=minNorm([...A1,...w1])}}F[si]={w0:A0??[],w1:A1??[]}}}return{...P,F}}

function equalSet(a,b){if(a.length!==b.length)return false;const x=[...a].sort((p,q)=>p-q),y=[...b].sort((p,q)=>p-q);return x.every((v,i)=>v===y[i])}
function compare(W,H,K){const B=baseline(W,H,K),D=dual(W,H,K);let mismatches=0;for(let i=0;i<B.S.length;i++){const U=B.S[i].U,expectedW1=minNorm(B.F[i].l.map(c=>(U&~c)>>>0));if(!equalSet(B.F[i].w,D.F[i].w0)||!equalSet(expectedW1,D.F[i].w1))mismatches++}return{columns:W,rows:H,connect:K,supports:B.S.length,mismatches}}

const results=[compare(4,3,3),compare(4,4,4),compare(5,3,4)];
if(results.some(x=>x.mismatches!==0))process.exitCode=1;
process.stdout.write(`${JSON.stringify(results,null,2)}\n`);
