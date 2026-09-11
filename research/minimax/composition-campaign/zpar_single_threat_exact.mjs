import assert from 'node:assert/strict';
import { parse } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { Wsl625ResidualSolver } from '../semantic-residual-mq5/residual_solver_wsl625.mjs';

const W=7,H=6,CELLS=42;
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){
  const x=c+3*dx,y=r+3*dy;if(x<0||x>=W||y<0||y>=H)continue;
  let m=0n;for(let j=0;j<4;j++)m|=1n<<BigInt((r+j*dy)*W+c+j*dx);lines.push(m);
}
assert.equal(lines.length,69);
function pc(v){let n=0;while(v){v&=v-1n;n++;}return n;}
function won(bits,bit){for(const line of lines)if((line&bit)!==0n&&(bits&line)===line)return true;return false;}
function residual(mine,opp){
  const occ=mine|opp,raw=[];for(const line of lines){if(line&opp)continue;const rem=line&~occ;if(rem)raw.push(rem);}
  raw.sort((a,b)=>pc(a)-pc(b)||(a<b?-1:a>b?1:0));const out=[];let prev=-1n;
  outer:for(const m of raw){if(m===prev)continue;prev=m;for(const p of out)if((p&~m)===0n)continue outer;out.push(m);}return out;
}
function cellOf(single){assert.equal(pc(single),1);let n=0,x=single;while((x&1n)===0n){x>>=1n;n++;}return n;}
function mirrorSeq(seq){let out='';for(const ch of seq)out+=String(8-Number(ch));return out;}
function p0Outcome(score,moves){if(score===0)return 0;const currentP0=(moves&1)===0;return score>0?(currentP0?1:-1):(currentP0?-1:1);}
function classify(t0,t1){
  const r0=Math.trunc(t0/W),c0=t0-r0*W,r1=Math.trunc(t1/W),c1=t1-r1*W;
  const whiteOdd=(r0&1)===0,blackEven=(r1&1)===1;
  if(whiteOdd&&blackEven){
    if(c0===c1){if(r0===r1)return null;return{pred:r0<r1?1:-1,kind:r0<r1?'WO_BE_same_white_lower':'WO_BE_same_black_lower'};}
    return{pred:1,kind:'WO_BE_diff'};
  }
  if(!whiteOdd&&blackEven)return{pred:-1,kind:'WE_BE'};
  if(!whiteOdd&&!blackEven){if(c0===c1)return null;return{pred:0,kind:'WE_BO_diff'};}
  if(whiteOdd&&!blackEven){if(c0===c1)return null;return{pred:0,kind:'WO_BO_diff'};}
  return null;
}
function rng(seed0){let seed=seed0>>>0;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};}
function randomState(rand,target){
  let p0=0n,p1=0n,seq='';const h=new Uint8Array(W);
  for(let mv=0;mv<target;mv++){
    const cs=[];for(let c=0;c<W;c++)if(h[c]<H){const bit=1n<<BigInt(h[c]*W+c),mine=(mv&1)?p1:p0;if(!won(mine|bit,bit))cs.push(c);}
    if(!cs.length)break;const c=cs[rand()%cs.length],bit=1n<<BigInt(h[c]*W+c);if(mv&1)p1|=bit;else p0|=bit;h[c]++;seq+=String(c+1);
  }
  return{p0,p1,h,seq,moves:seq.length};
}
function candidate(st){
  const a=residual(st.p0,st.p1),b=residual(st.p1,st.p0);if(a.length!==1||b.length!==1||pc(a[0])!==1||pc(b[0])!==1)return null;
  const t0=cellOf(a[0]),t1=cellOf(b[0]);if(t0===t1)return null;
  const r0=Math.trunc(t0/W),c0=t0-r0*W,r1=Math.trunc(t1/W),c1=t1-r1*W;
  if(r0<=st.h[c0]||r1<=st.h[c1])return null; // strategic, not immediately playable
  const q=classify(t0,t1);if(!q)return null;return{...q,t0,t1,r0,c0,r1,c1};
}
function solveOne(seq){const pos=parse(seq),solver=new Wsl625ResidualSolver(19),score=solver.solve(pos);return{score,outcome:p0Outcome(score,pos.moves),nodes:solver.metrics().nodes};}

const seeds=[0x7a11c0de,0x19d3f00d],targetMatches=96,maxAttempts=350000,cohorts=[];
for(const seed of seeds){
  const rand=rng(seed);let attempts=0,baseMatches=0;const cases={},mismatches=[],examples=[];let oracleNodes=0;
  while(attempts<maxAttempts&&baseMatches<targetMatches){attempts++;const ply=30+(rand()%11),st=randomState(rand,ply);if(st.moves!==ply)continue;const cand=candidate(st);if(!cand)continue;
    baseMatches++;for(const seq of[st.seq,mirrorSeq(st.seq)]){
      const q=seq===st.seq?cand:candidate((()=>{const x=randomState(()=>0,0);const p=parse(seq);/* only sequence is needed below; recompute row-major board deterministically */let p0=0n,p1=0n;const h=new Uint8Array(W);for(let mv=0;mv<seq.length;mv++){const c=Number(seq[mv])-1,bit=1n<<BigInt(h[c]*W+c);if(mv&1)p1|=bit;else p0|=bit;h[c]++;}return{p0,p1,h,seq,moves:seq.length};})());
      assert(q);const o=solveOne(seq);oracleNodes+=o.nodes;const ok=o.outcome===q.pred;const row=cases[q.kind]??(cases[q.kind]={samples:0,mismatches:0});row.samples++;if(!ok){row.mismatches++;if(mismatches.length<24)mismatches.push({seq,kind:q.kind,predicted:q.pred,actual:o.outcome,score:o.score,t0:q.t0,t1:q.t1});}else if(examples.length<12)examples.push({seq,kind:q.kind,outcome:o.outcome,score:o.score});
    }
  }
  cohorts.push({seed:`0x${seed.toString(16)}`,attempts,baseMatches,qualifiedSamples:baseMatches*2,cases,mismatchCount:mismatches.length,mismatches,examples,oracleNodes});
}
const totalSamples=cohorts.reduce((s,c)=>s+c.qualifiedSamples,0),totalMismatches=cohorts.reduce((s,c)=>s+Object.values(c.cases).reduce((a,x)=>a+x.mismatches,0),0),caseKinds=[...new Set(cohorts.flatMap(c=>Object.keys(c.cases)))];
assert(totalSamples>=64,'insufficient qualifying ZPAR samples');assert(caseKinds.length>=2,'insufficient ZPAR case diversity');
console.log(JSON.stringify({kind:'connect4-zpar-single-threat-exact-differential',status:'complete',authority:'research differential only; no pruning authority is granted by this run',predicate:'each player has exactly one nonplayable singleton residual requirement and no other surviving winning requirement; apply classic White/Black odd-even threat classification with explicit mixed-parity same-column undercut',sources:'Allis threat-parity analysis; exact oracle is current WSL-625 residual solver',totalSamples,totalMismatches,caseKinds,cohorts},null,2));
