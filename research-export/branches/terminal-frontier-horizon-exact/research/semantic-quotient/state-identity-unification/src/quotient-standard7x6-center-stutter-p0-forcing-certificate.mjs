#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
// Prior response-rule provenance: Victor Allis (1988), Claimeven/Baseinverse/Lowinverse.
//
// IMPORTANT: CANDIDATE / FALSIFICATION ARTIFACT, NOT A THEOREM.
//
// This control verifies that explicit pairwise-compatible flat rule sets can be
// written after non-center P0 deviations from the center stutter prefixes.  That
// fact alone is NOT enough to prove a draw: a complete proof must also establish
// the global controller-of-Zugzwang / opponent threat-combination premises.
// The discovery that flat coverage can overclaim in the unresolved center line
// is precisely why the active work moved to nested deadline/control closure.

const W=7,H=6,K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const CENTER=3;
const key=([x,y])=>`${x},${y}`;
function lines(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const[dx,dy]of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([a,b])=>a>=0&&a<W&&b>=0&&b<H))out.push(cells);
  }
  return out;
}
const L=lines();
function play(cols){
  const h=Array(W).fill(0),p=[new Set(),new Set()];
  cols.forEach((c,i)=>{assert(c>=0&&c<W&&h[c]<H);const q=[c,h[c]++];p[i&1].add(key(q));});
  return{p0:p[0],p1:p[1],h};
}
function claim(col,lo){const up=lo+1;assert.equal((up+1)&1,0);return{kind:'claim',squares:[[col,lo],[col,up]],upper:[col,up]};}
function baseinverse(a,b){return{kind:'baseinverse',squares:[[a,0],[b,0]]};}
function lowinverse(a,b,lo){const up=lo+1;assert.equal((up+1)&1,1);return{kind:'lowinverse',squares:[[a,lo],[a,up],[b,lo],[b,up]],columns:[a,b],lo,up};}
function cover(rule,line){
  const s=new Set(line.map(key));
  if(rule.kind==='claim')return s.has(key(rule.upper));
  if(rule.kind==='baseinverse')return rule.squares.every(q=>s.has(key(q)));
  const[a,b]=rule.columns;
  return (s.has(key([a,rule.up]))&&s.has(key([b,rule.up])))
    ||(s.has(key([a,rule.lo]))&&s.has(key([a,rule.up])))
    ||(s.has(key([b,rule.lo]))&&s.has(key([b,rule.up])));
}
function disjoint(a,b){const A=new Set(a.squares.map(key));return b.squares.every(q=>!A.has(key(q)));}
function compatible(a,b){
  if(a.kind==='claim'&&b.kind==='claim')return disjoint(a,b);
  if(a.kind==='baseinverse'||b.kind==='baseinverse')return disjoint(a,b);
  if(a.kind==='lowinverse'&&b.kind==='lowinverse'){
    if(!disjoint(a,b))return false;
    const A=new Set(a.columns),B=new Set(b.columns),over=[...A].some(c=>B.has(c));
    return !over||(A.size===B.size&&[...A].every(c=>B.has(c)));
  }
  // Allis compatibility code 2 for Claimeven/Lowinverse: no claim below inverse.
  const c=a.kind==='claim'?a:b,inv=a.kind==='lowinverse'?a:b;
  const col=c.squares[0][0],claimHigh=c.squares[1][1];
  return inv.columns.every(x=>x!==col||claimHigh>=inv.lo);
}
function replyFor(c){assert(c!==CENTER);if(c<3)return c<=1?c+1:4;return W-1-replyFor(W-1-c);}
function basePairFor(c){if(c<3)return c<=1?[4,5]:[0,1];return basePairFor(W-1-c).map(x=>W-1-x).sort((a,b)=>a-b);}
function flatCandidate(height,c){
  const rules=[];
  for(const[a,b]of[[1,2],[4,5]])for(const lo of[1,3])rules.push(lowinverse(a,b,lo));
  for(const x of[0,2,4,6])rules.push(claim(x,2));
  if(height===2)rules.push(claim(CENTER,2));
  rules.push(claim(CENTER,4));
  rules.push(baseinverse(...basePairFor(c)));
  return rules;
}
function audit(height,c){
  const seq=[...Array(height).fill(CENTER),c,replyFor(c)],st=play(seq),occ=new Set([...st.p0,...st.p1]);
  const rules=flatCandidate(height,c);
  for(const r of rules)assert(r.squares.every(q=>!occ.has(key(q))));
  for(let i=0;i<rules.length;i++)for(let j=0;j<i;j++)assert(compatible(rules[i],rules[j]));
  const live=L.filter(line=>!line.some(q=>st.p1.has(key(q))));
  const uncovered=live.filter(line=>!rules.some(r=>cover(r,line)));
  assert.equal(uncovered.length,0);
  return{height,deviation:c,reply:replyFor(c),flatRules:rules.length,liveP0Groups:live.length};
}
const reports=[];for(const h of[2,4])for(const c of[0,1,2,4,5,6])reports.push(audit(h,c));

console.log(`CENTER_STUTTER_FLAT_COVER_GAP=${JSON.stringify({
  proved:false,
  candidateCoverageVerified:true,
  reports,
  missingPremise:'global controller-of-Zugzwang / nested opponent threat-combination and deadline closure',
  falsifier:'Pairwise-compatible rule coverage is not sufficient proof authority in the unresolved center line; treating it as sufficient can overclaim a draw. The rule set is retained only as a candidate local layer for NDC.',
  proofBoundary:'No D3/D5 forcing theorem is promoted by this file. A later NDC theorem may reuse these local response programs only after proving their global control/deadline guards.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'}
})}`);
