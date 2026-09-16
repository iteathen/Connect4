import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {parse,bits,won,brute,rng,trajectory} from './domain.mjs';
import {compile,makeGeometry} from './requirements.mjs';
import {Solver as Base} from '../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs';
import {Solver as Key} from './kernel-key.mjs';
import {Solver as Neutral} from './kernel-neutral.mjs';
import {Solver as Both} from './kernel-both.mjs';
const out=[],emit=x=>{out.push(x);console.log(JSON.stringify(x));};
function canonical(req) {return req.map(a=>a.map(r=>r.join(':')).sort().join(',')).join('|');}
function reduced(rs) {return rs.filter((r,i)=>!rs.some((q,j)=>j!==i&&((q[0]&r[0])>>>0)===q[0]&&((q[1]&r[1])>>>0)===q[1]&&(q[0]!==r[0]||q[1]!==r[1]||j<i)));}
const s=parse('',4,3,3),g=makeGeometry(4,3,3),memo=new Map(),groups=new Map();
let edges=0,transitions=0,neutralActionChecks=0,multiBoardGroups=0,groupMembers=0,mergeWitness=null,tempoWitness=null;
function visit(seq='') {
  const b=bits(s),key=b.p0Lo*65536+b.mLo;
  if(memo.has(key))return memo.get(key);
  const cp=compile(s,g),m=s.moves,p=(m&1)+1,actions=new Array(4).fill(null);let value=-100;
  for(let c=0;c<4;c++) {
    const r=s.heights[c];if(r===3)continue;edges++;
    s.board[r*4+c]=p;s.heights[c]++;s.moves++;
    if(won(s.board,4,3,3,c,r,p))actions[c]=Math.floor((13-m)/2);
    else {
      const bit=1<<(c*4+r),expected=cp.req.map((rs,owner)=>reduced(owner===p-1?rs.map(x=>[(x[0]&~bit)>>>0,x[1]]):rs.filter(x=>!(x[0]&bit))));
      assert.equal(canonical(expected),canonical(compile(s,g).req),'winning-requirement transition');transitions++;
      actions[c]=-visit(seq+String(c+1));
    }
    s.board[r*4+c]=0;s.heights[c]--;s.moves--;value=Math.max(value,actions[c]);
  }
  if(value===-100)value=0;
  let neutralValue=null;
  for(let c=0;c<4;c++)if(cp.neutralCols&(1<<c)){if(neutralValue!==null){assert.equal(actions[c]||0,neutralValue||0);neutralActionChecks++;}neutralValue=actions[c];}
  const without=actions.filter((v,c)=>v!==null&&!(cp.neutralCols&(1<<c))),wrong=without.length?Math.max(...without):0;
  if(!tempoWitness&&wrong!==value)tempoWitness={seq,moves:m,score:value,scoreIfNeutralChoicesDeleted:wrong,neutralCols:cp.neutralCols,actions,req:cp.req};
  const q=s.heights.join(',')+'|'+(m&1)+'|'+canonical(cp.req);
  if(groups.has(q)) {
    const v=groups.get(q);assert.equal(value||0,v.value||0);assert.deepEqual(actions.map(v=>v===null?null:v||0),v.actions);groupMembers++;
    if(v.count++===1)multiBoardGroups++;
    if(!mergeWitness&&key!==v.key&&m<12&&cp.minCounts[0]+cp.minCounts[1]>0)mergeWitness={seqA:v.seq,seqB:seq,score:value,actions,req:cp.req,heights:[...s.heights]};
  }else groups.set(q,{key,seq,value,actions:actions.map(v=>v===null?null:v||0),count:1});
  memo.set(key,value||0);return value||0;
}
const rootValue=visit();assert(tempoWitness);assert(mergeWitness);
emit({kind:'exhaustiveSmallGame',board:'4x3 connect-3',rootValue,states:memo.size,edges,requirementTransitions:transitions,quotientGroups:groups.size,multiBoardGroups,extraMembers:groupMembers,neutralActionChecks,mergeWitness,tempoWitness,passed:true});
const g7=makeGeometry(),random=rng(0x4c409026),solvers=[new Base(15),new Key(15),new Neutral(15),new Both(15)];
const cases=[];let oracleNodes=0,mergedOracleNodes=0,tries=0;
function clear(q){q.keyLo.fill(0);q.keyHi.fill(0);q.val.fill(0);q.ctrl.fill(0);q.owner.fill(0);q.resetMetrics();}
while(cases.length<96) {
  tries++;const t=trajectory(random,34+(cases.length%3),{avoidWins:true});if(!t)continue;
  const cp=compile(t.state,g7),b=bits(t.state),v=brute(t.state),v2=brute(t.state,{neutralCols:cp.neutralCols,mergeNeutral:true});
  assert.equal(v.value,v2.value);oracleNodes+=v.nodes;mergedOracleNodes+=v2.nodes;
  const scores=[],nodes=[];
  for(const q of solvers){clear(q);q.relevantLo=cp.relevantLo;q.relevantHi=cp.relevantHi;q.neutralCols=cp.neutralCols;const score=q.solveBits(b.cLo,b.cHi,b.mLo,b.mHi,b.moves)||0;assert.equal(score,v.value,`${t.seq}`);scores.push(score);nodes.push(q.nodes);}
  cases.push({seq:t.seq,ply:b.moves,score:v.value,nodes,oracleNodes:v.nodes,mergedOracleNodes:v2.nodes,neutralColumns:cp.neutralColumns,erasedCells:cp.erasedCells});
}
emit({kind:'independent7x6',passed:true,cases:cases.length,tries,oracleNodes,mergedOracleNodes,values:cases});
const tactical=parse('121212'),bt=bits(tactical);for(const q of solvers){clear(q);q.relevantLo=0xffffffff;q.relevantHi=0xffffffff;q.neutralCols=0;assert.equal(q.solveBits(bt.cLo,bt.cHi,bt.mLo,bt.mHi,bt.moves),18);}
emit({kind:'rootGuard',seq:'121212',expected:18,passed:true});
writeFileSync(new URL('../../../docs/research/evidence/2026-09-09-structural-quotient/qualification.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
