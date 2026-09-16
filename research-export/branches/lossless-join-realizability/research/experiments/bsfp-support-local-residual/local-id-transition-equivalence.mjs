#!/usr/bin/env node

// Exact support-local residual-ID qualification on complete small controls.
// The local vocabulary is ALL UNIQUE nonempty (line \ support) masks.
// It is deliberately not antichain-normalized globally: a geometrically
// dominated term may be the only live term after ownership-specific blocking.

function pc(m){m>>>=0;let c=0;while(m){m&=m-1;c++;}return c}
function subset(a,b){return (a&~b)===0}
function bits(m,f){m>>>=0;let i=0;while(m){if(m&1)f(i);m>>>=1;i++}}
function norm(xs){const a=[...new Set(xs.map(x=>x>>>0).filter(Boolean))].sort((x,y)=>pc(x)-pc(y)||x-y),r=[];outer:for(const x of a){for(const y of r)if(subset(y,x))continue outer;r.push(x)}return r}
function lines(W,H,K){const o=[],idx=(c,r)=>r*W+c;for(let r=0;r<H;r++)for(let c=0;c<=W-K;c++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r);o.push(m>>>0)}for(let c=0;c<W;c++)for(let r=0;r<=H-K;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c,r+i);o.push(m>>>0)}for(let c=0;c<=W-K;c++)for(let r=0;r<=H-K;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r+i);o.push(m>>>0)}for(let c=0;c<=W-K;c++)for(let r=K-1;r<H;r++){let m=0;for(let i=0;i<K;i++)m|=1<<idx(c+i,r-i);o.push(m>>>0)}return o}
function supports(W,H){const h=Array(W).fill(0),o=[];function rec(c){if(c===W){let U=0,r=0;for(let x=0;x<W;x++)for(let y=0;y<h[x];y++){U|=1<<(y*W+x);r++}o.push({h:[...h],U:U>>>0,rank:r,key:h.join(',')});return}for(let v=0;v<=H;v++){h[c]=v;rec(c+1)}}rec(0);return o}
function choose(U,k){const cells=[];bits(U,i=>cells.push(i));const out=[];function rec(i,left,m){if(left===0){out.push(m>>>0);return}if(cells.length-i<left)return;rec(i+1,left-1,m|(1<<cells[i]));rec(i+1,left,m)}rec(0,k,0);return out}
function hasWin(owner,LS){return LS.some(l=>subset(l,owner))}
function residuals(U,p0,LS){const p1=(U&~p0)>>>0,r0=[],r1=[];for(const l of LS){const occ=l&U,rem=(l&~U)>>>0;if(!rem)continue;if((occ&p1)===0)r0.push(rem);if((occ&p0)===0)r1.push(rem)}return{r0:norm(r0),r1:norm(r1)}}
function basis(U,LS){return [...new Set(LS.map(l=>(l&~U)>>>0).filter(Boolean))].sort((a,b)=>pc(a)-pc(b)||a-b)}
function localize(rs,B){const map=new Map(B.map((m,i)=>[m,i])),ids=rs.map(r=>map.get(r));if(ids.some(x=>x===undefined))throw new Error('residual term escaped support-local vocabulary');return ids.sort((a,b)=>a-b)}
function delocalize(ids,B){return norm(ids.map(i=>B[i]))}
function transition(idsOwn,idsOpp,parentBasis,childBasis,x){const childMap=new Map(childBasis.map((m,i)=>[m,i])),own=[],opp=[];for(const id of idsOwn){const q=(parentBasis[id]&~(1<<x))>>>0;if(q===0)return{terminal:true};const childId=childMap.get(q);if(childId===undefined)throw new Error('mover residual has no child-local ID');own.push(childId)}for(const id of idsOpp){const r=parentBasis[id];if(r&(1<<x))continue;const childId=childMap.get(r);if(childId===undefined)throw new Error('opponent residual has no child-local ID');opp.push(childId)}const normalizeIds=ids=>localize(norm(ids.map(i=>childBasis[i])),childBasis);return{terminal:false,own:normalizeIds(own),opp:normalizeIds(opp)}}
function eq(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])}

function test(W,H,K){if(W*H>=31)throw new RangeError('small-control qualifier uses u32 masks');const LS=lines(W,H,K),S=supports(W,H),byKey=new Map(S.map(s=>[s.key,s]));let states=0,actions=0,terminalActions=0,roundtripMismatches=0,transitionMismatches=0,maxBasis=0,totalBasis=0;for(const s of S){const B=basis(s.U,LS);maxBasis=Math.max(maxBasis,B.length);totalBasis+=B.length;const k0=Math.ceil(s.rank/2);for(const p0 of choose(s.U,k0)){const p1=(s.U&~p0)>>>0;if(hasWin(p0,LS)||hasWin(p1,LS))continue;states++;const R=residuals(s.U,p0,LS),id0=localize(R.r0,B),id1=localize(R.r1,B);if(!eq(delocalize(id0,B),R.r0)||!eq(delocalize(id1,B),R.r1))roundtripMismatches++;const mover=s.rank&1;for(let c=0;c<W;c++){const row=s.h[c];if(row>=H)continue;actions++;const x=row*W+c,ch=[...s.h];ch[c]++;const child=byKey.get(ch.join(',')),Bc=basis(child.U,LS),own=mover===0?id0:id1,opp=mover===0?id1:id0,t=transition(own,opp,B,Bc,x),childP0=mover===0?(p0|(1<<x))>>>0:p0,childP1=(child.U&~childP0)>>>0,winner=hasWin(mover===0?childP0:childP1,LS);if(winner){terminalActions++;if(!t.terminal)transitionMismatches++;continue}if(t.terminal){transitionMismatches++;continue}const CR=residuals(child.U,childP0,LS),expectedOwn=localize(mover===0?CR.r0:CR.r1,Bc),expectedOpp=localize(mover===0?CR.r1:CR.r0,Bc);if(!eq(t.own,expectedOwn)||!eq(t.opp,expectedOpp))transitionMismatches++}}}return{columns:W,rows:H,connect:K,winningLines:LS.length,supports:S.length,nonterminalStates:states,legalActions:actions,terminalActions,roundtripMismatches,transitionMismatches,maxLocalBasis:maxBasis,meanLocalBasis:totalBasis/S.length}}

const results=[test(4,3,3),test(4,4,4),test(5,3,4)];
if(results.some(r=>r.roundtripMismatches!==0||r.transitionMismatches!==0))process.exitCode=1;
process.stdout.write(`${JSON.stringify(results,null,2)}\n`);
