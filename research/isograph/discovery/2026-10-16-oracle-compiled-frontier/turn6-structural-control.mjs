#!/usr/bin/env node
// Bounded, oracle-blind turn-6 proof-target probe.
// Domain: ordinary standard 7x6 first-win physical states; q uses exact
// residual-line antichains, not stored values or solved move labels.
import assert from 'node:assert/strict';
import { canonicalizeG2Fiber } from '../2026-09-18-policy-frontier/rba-g2-fiber-equivalence.mjs';
const W=7,H=6,K=4;
const DIRECTIONS=[[1,0],[0,1],[1,1],[1,-1]];
const bit=(c,r)=>1n<<BigInt(r*W+c);
function popcount(x){let n=0;for(;x;x&=x-1n)n++;return n;}
function cmp(a,b){return a<b?-1:a>b?1:0;}
function lineBasis(){
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of DIRECTIONS){
    const ec=c+(K-1)*dx,er=r+(K-1)*dy;
    if(ec<0||ec>=W||er<0||er>=H)continue;
    let mask=0n,coords=[];
    for(let k=0;k<K;k++){
      const x=c+k*dx,y=r+k*dy;
      mask|=bit(x,y);coords.push([x,y]);
    }
    out.push({mask,coords});
  }
  assert.equal(out.length,69);
  assert.equal(new Set(out.map(x=>String(x.mask))).size,69);
  return out;
}
const LINES=lineBasis();
function occupied(state){return state.p0|state.p1;}
function minimize(xs){
  const order=[...new Set(xs.map(String))].map(BigInt)
    .sort((a,b)=>popcount(a)-popcount(b)||cmp(a,b));
  const kept=[];
  for(const x of order)if(!kept.some(y=>(y&x)===y))kept.push(x);
  return kept;
}
function residual(state,who){
  const their=who===0?state.p1:state.p0;
  const used=occupied(state);
  const xs=[];
  for(const {mask} of LINES)if((mask&their)===0n)xs.push(mask&~used);
  return minimize(xs);
}
function exactQ(state){return {h:state.h.slice(),p:state.rank%2,R0:residual(state,0),R1:residual(state,1)};}
function move(state,c){
  if(!Number.isInteger(c)||c<0||c>=W||state.h[c]>=H||state.terminal!==null)return null;
  const copy={h:state.h.slice(),p0:state.p0,p1:state.p1,rank:state.rank+1,terminal:null};
  const who=state.rank%2,x=bit(c,copy.h[c]++);
  if(who===0)copy.p0|=x;else copy.p1|=x;
  const own=who===0?copy.p0:copy.p1;
  if(LINES.some(line=>(line.mask&own)===line.mask))copy.terminal=who;
  else if(copy.rank===W*H)copy.terminal=2;
  return copy;
}
function replay(sequence){
  let state={h:Array(W).fill(0),p0:0n,p1:0n,rank:0,terminal:null};
  for(const ch of sequence){
    const next=move(state,Number(ch)-1);
    if(next===null)throw Error('illegal first-win replay '+sequence);
    state=next;
  }
  return state;
}
function same(xs,ys){
  return xs.length===ys.length&&xs.every((x,i)=>x===ys[i]);
}
function oneCofactor(q,c){
  if(q.h[c]>=H)throw Error('illegal q cofactor '+c);
  const x=bit(c,q.h[c]),own=q.p===0?'R0':'R1',opp=q.p===0?'R1':'R0';
  const child={h:q.h.slice(),p:1-q.p,R0:[],R1:[]};
  child.h[c]++;
  child[own]=minimize(q[own].map(m=>m&~x));
  child[opp]=minimize(q[opp].filter(m=>(m&x)===0n));
  return child;
}
function compareQ(a,b){
  return a.p===b.p&&a.h.every((x,i)=>x===b.h[i])
    &&same(a.R0,b.R0)&&same(a.R1,b.R1);
}
function legal(state){return state.terminal!==null?[]:state.h.flatMap((n,c)=>n<H?[c]:[]);}
function immediateWins(state,who){
  if(state.terminal!==null||state.rank%2!==who)throw Error('immediateWins mover mismatch');
  return legal(state).filter(c=>move(state,c).terminal===who);
}
function histogram(xs){
  const out={};
  for(const x of xs){const n=popcount(x);out[n]=(out[n]??0)+1;}
  return out;
}
function rowSummary(state){
  const q=exactQ(state);
  return {rank:state.rank,support:state.h,sideToMove:state.rank%2,
    residual0:histogram(q.R0),residual1:histogram(q.R1),
    g2CanonicalKey:canonicalizeG2Fiber(state.h).key,
    immediateMoverWins:state.terminal===null?immediateWins(state,state.rank%2).map(x=>x+1):[],
    terminal:state.terminal};
}
// Prove *only* a two-P0-move win: after P0's first action every P1
// response must leave P0 an immediate one-action winning move.
// Every opponent action is inspected, and an immediate opponent win falsifies.
function twoP0MoveCertificate(state){
  if(state.terminal!==null||state.rank%2!==0)throw Error('two-move checker needs P0 turn');
  const attempts=[];
  for(const a of legal(state)){
    const afterA=move(state,a);
    if(afterA.terminal===0){
      attempts.push({action:a+1,checkedP1Replies:0,coveredP1Replies:0,closed:true,immediate:true});
      continue;
    }
    const replies=legal(afterA),bad=[];
    for(const b of replies){
      const afterB=move(afterA,b);
      if(afterB.terminal===1){
        bad.push({P1Reply:b+1,reason:'P1 terminal first'});
      }else if(afterB.terminal===2){
        bad.push({P1Reply:b+1,reason:'board draw'});
      }else if(immediateWins(afterB,0).length===0){
        bad.push({P1Reply:b+1,reason:'P0 has no immediate terminal action'});
      }
    }
    attempts.push({action:a+1,checkedP1Replies:replies.length,
      coveredP1Replies:replies.length-bad.length,closed:bad.length===0,
      firstCounterexample:bad[0]??null});
  }
  return {closedActions:attempts.filter(x=>x.closed).map(x=>x.action),
    bestCoverage:Math.max(...attempts.map(x=>x.coveredP1Replies)),
    attempts};
}
export function probeTurnSix(){
  const root=replay('44444');
  assert.equal(root.rank,5);
  assert.equal(root.terminal,null);
  assert.equal(root.rank%2,1);
  const parentQ=exactQ(root),actions=[],classes=new Map(),mirrorSymmetryErrors=[];
  for(const c of legal(root)){
    const child=move(root,c),qFromPhysical=exactQ(child),qFromAlgebra=oneCofactor(parentQ,c);
    assert.ok(compareQ(qFromPhysical,qFromAlgebra),'q cofactor disagree at '+(c+1));
    const g2=canonicalizeG2Fiber(child.h),mate=c===3?3:6-c;
    const mirrorChild=move(root,mate);
    if(!same(minimize(residual(child,0).map(mask=>mirrorMask(mask))),
      residual(mirrorChild,0)))mirrorSymmetryErrors.push(c+1);
    let cls=classes.get(g2.key);
    if(!cls){cls=[];classes.set(g2.key,cls);}
    cls.push(c+1);
    actions.push({P1Action:c+1,mirrorAction:mate+1,
      state:rowSummary(child),
      twoP0MoveProof:twoP0MoveCertificate(child)});
  }
  assert.deepEqual(mirrorSymmetryErrors,[]);
  return {schema:'connect4.turn6-structural-candidate.v0_1',
    sourcePrefix:'44444',lineBasisCount:LINES.length,
    root:rowSummary(root),g2SupportClassCount:classes.size,
    g2SupportActionClasses:[...classes.values()],
    qTransitionChecks:actions.length,qTransitionDisagreements:0,
    mirrorSymmetryDisagreements:mirrorSymmetryErrors.length,
    childActions:actions,
    solverNodeSearchUsed:false,oracleCalls:0,
    conclusion:'Two-P0-move certificate is sufficient if any closedAction exists; absence proves only this restricted certificate fails.'
  };
}
function mirrorMask(m){
  let out=0n;
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)if(m&bit(c,r))out|=bit(W-1-c,r);
  return out;
}
if(process.argv[1]&&process.argv[1].endsWith('turn6-structural-control.mjs'))
  console.log(JSON.stringify(probeTurnSix(),null,2));

// Expose unchanged oracle-blind primitives to local bounded certificate controls.
export { replay, move, legal, residual, exactQ, bit, LINES, popcount };
