#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
// Prior response-rule provenance: Victor Allis (1988), Claimeven/Baseinverse/Lowinverse.
//
// Searchless conditional selection theorem for standard 7x6:
//   after D1 d2, any P0 forced win requires D3;
//   after D1 d2 D3 d4, any P0 forced win requires D5.
//
// The proof uses explicit static response certificates only.  There is no rule-set
// search, legal-continuation recursion, solved W/D/L label, strong-distance score,
// or predefined terminal-line count in this control.

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
function claim(col,lo){
  const up=lo+1;assert.equal((up+1)&1,0,'Claimeven upper must be one-based even');
  return{kind:'claim',squares:[[col,lo],[col,up]],upper:[col,up]};
}
function baseinverse(a,b){return{kind:'baseinverse',squares:[[a,0],[b,0]]};}
function lowinverse(a,b,lo){
  const up=lo+1;assert.equal((up+1)&1,1,'Lowinverse upper must be one-based odd');
  return{kind:'lowinverse',squares:[[a,lo],[a,up],[b,lo],[b,up]],columns:[a,b],lo,up};
}
function cover(rule,line){
  const s=new Set(line.map(key));
  if(rule.kind==='claim')return s.has(key(rule.upper));
  if(rule.kind==='baseinverse')return rule.squares.every(q=>s.has(key(q)));
  const [a,b]=rule.columns;
  return (s.has(key([a,rule.up]))&&s.has(key([b,rule.up])))
      || (s.has(key([a,rule.lo]))&&s.has(key([a,rule.up])))
      || (s.has(key([b,rule.lo]))&&s.has(key([b,rule.up])));
}
function claimInterval(rule){return rule.kind==='claim'?{col:rule.squares[0][0],low:rule.squares[0][1],high:rule.squares[1][1]}:null;}
function inverseIntervals(rule){return rule.kind==='lowinverse'?rule.columns.map(col=>({col,low:rule.lo,high:rule.up})):[];}
function squaresByColumn(rule,col){return new Set(rule.squares.filter(([x])=>x===col).map(key));}
function disjointSquares(a,b){const A=new Set(a.squares.map(key));return b.squares.every(q=>!A.has(key(q)));}
function compatible(a,b){
  // Conservative Allis table restricted to A1/A2/A5.
  if(a.kind==='claim'&&b.kind==='claim')return disjointSquares(a,b); // code 1
  if(a.kind==='baseinverse'||b.kind==='baseinverse')return disjointSquares(a,b); // A2 with A1/A5: code 1
  if(a.kind==='lowinverse'&&b.kind==='lowinverse'){
    // code 4 = disjoint squares and inverse-column sets disjoint or equal.
    if(!disjointSquares(a,b))return false;
    const A=new Set(a.columns),B=new Set(b.columns),over=[...A].some(c=>B.has(c));
    return !over || (A.size===B.size&&[...A].every(c=>B.has(c)));
  }
  // A1/A5: code 2 = no Claimeven below an inverse.  Boundary sharing is allowed.
  const c=a.kind==='claim'?claimInterval(a):claimInterval(b);
  const inv=a.kind==='lowinverse'?inverseIntervals(a):inverseIntervals(b);
  return inv.every(i=>i.col!==c.col || c.high>=i.low);
}
function replyFor(nonCenter){
  assert(nonCenter!==CENTER);
  if(nonCenter<3){
    if(nonCenter<=1)return nonCenter+1;
    return 4;
  }
  return W-1-replyFor(W-1-nonCenter);
}
function basePairFor(nonCenter){
  if(nonCenter<3)return nonCenter<=1?[4,5]:[0,1];
  return basePairFor(W-1-nonCenter).map(c=>W-1-c).sort((a,b)=>a-b);
}
function certificate(centerStackHeight,nonCenter){
  assert([2,4].includes(centerStackHeight));assert(nonCenter!==CENTER);
  const rules=[];
  // Four fixed inverse reservoirs.  They pair columns (1,2) and (4,5) at
  // one-based rows 2-3 and 4-5.
  for(const [a,b]of[[1,2],[4,5]])for(const lo of[1,3])rules.push(lowinverse(a,b,lo));
  // Row 3-4 Claimevens in the four exterior parity columns.  At stack height
  // two the center pair is also still available; at height four it is occupied.
  for(const c of[0,2,4,6])rules.push(claim(c,2));
  if(centerStackHeight===2)rules.push(claim(CENTER,2));
  // Top center Claimeven survives in both profiles.
  rules.push(claim(CENTER,4));
  const [a,b]=basePairFor(nonCenter);rules.push(baseinverse(a,b));
  return rules;
}
function verify(centerStackHeight,nonCenter){
  const prefix=Array(centerStackHeight).fill(CENTER);
  const reply=replyFor(nonCenter);
  const seq=[...prefix,nonCenter,reply];
  const st=play(seq),occupied=new Set([...st.p0,...st.p1]);
  const rules=certificate(centerStackHeight,nonCenter);
  for(const r of rules)assert(r.squares.every(q=>!occupied.has(key(q))),`rule resource occupied for ${seq}`);
  for(let i=0;i<rules.length;i++)for(let j=0;j<i;j++)assert(compatible(rules[i],rules[j]),`incompatible certificate rules ${i}/${j}`);
  const live=L.filter(line=>!line.some(q=>st.p1.has(key(q))));
  const uncovered=live.filter(line=>!rules.some(r=>cover(r,line)));
  assert.equal(uncovered.length,0,`uncovered P0 group after ${seq}`);
  return{centerStackHeight,nonCenter,reply,ruleCount:rules.length,liveP0Groups:live.length,
    kinds:Object.fromEntries(['claim','lowinverse','baseinverse'].map(k=>[k,rules.filter(r=>r.kind===k).length]))};
}
const reports=[];
for(const height of[2,4])for(const c of[0,1,2,4,5,6])reports.push(verify(height,c));

assert(reports.filter(r=>r.centerStackHeight===2).every(r=>r.ruleCount===11));
assert(reports.filter(r=>r.centerStackHeight===4).every(r=>r.ruleCount===10));

console.log(`CENTER_STUTTER_P0_FORCING=${JSON.stringify({
  proved:true,
  theorem:[
    'after D1 d2, P0 forced win implies D3',
    'after D1 d2 D3 d4, P0 forced win implies D5'
  ],
  responseMap:{A1:'b1',B1:'c1',C1:'e1',E1:'c1',F1:'e1',G1:'f1'},
  fixedCertificate:{
    lowinverse:'columns B-C and E-F at rows 2-3 and 4-5 one-based',
    claimsAtHeight2:'A3-A4,C3-C4,D3-D4,E3-E4,G3-G4,D5-D6',
    claimsAtHeight4:'A3-A4,C3-C4,E3-E4,G3-G4,D5-D6',
    sideBaseinverse:'E1-F1 for A/B deviations, A1-B1 for C deviation, horizontal reflection on the right'
  },
  reports,
  consequence:'Conditional on P1 choosing d2 then d4, P0 center moves D1,D3,D5 are each necessary for any P0 forced win.',
  proofBoundary:'Static response-certificate theorem. It does not prove that P1 chooses d2/d4 under strong-distance optimality, and it does not use recursive game-tree evaluation or oracle scores.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'}
})}`);
