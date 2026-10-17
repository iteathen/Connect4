import {compileGuardedActionQBF} from './guarded-action-qbf.mjs';
import {projectUnateWitnessFirstActionVector,composeOptimalActionVector} from './guarded-action-qbf-unate-witness.mjs';
const dirs=[[1,0],[0,1],[1,1],[1,-1]];
function geometry({width:W,height:H,connect:K}){
  const lines=[];
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of dirs){
    if(c+(K-1)*dx<0||c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
    lines.push(Array.from({length:K},(_,j)=>(r+j*dy)*W+c+j*dx));
  }
  function initial(){return {b:Array(W*H).fill(-1),h:Array(W).fill(0),rank:0,history:''};}
  function step(s,c){
    if(!Number.isInteger(c)||c<0||c>=W||s.h[c]===H)throw Error('illegal physical step');
    const b=s.b.slice(),h=s.h.slice(),p=s.rank%2;
    b[h[c]*W+c]=p;h[c]++;
    const term=lines.some(line=>line.every(i=>b[i]===p))?p:
      s.rank+1===W*H?2:null;
    return {state:{b,h,rank:s.rank+1,history:s.history+String(c+1)},term};
  }
  function replay(history){let s=initial();for(const ch of history){const n=step(s,Number(ch)-1);if(n.term!==null)throw Error('terminal prefix: '+history);s=n.state;}return s;}
  function fromPhysical(s){
    const R=[0,1].map(p=>{
      const raw=lines.filter(line=>!line.some(i=>s.b[i]===1-p)).map(line=>
        line.filter(i=>s.b[i]===-1).reduce((x,i)=>x|(1n<<BigInt(i)),0n));
      const uniq=[...new Set(raw.map(String))].map(BigInt);
      return uniq.filter(a=>!uniq.some(b=>a!==b&&(a&b)===b));
    });
    return {h:s.h.slice(),R0:R[0],R1:R[1]};
  }
  function exactBoundedActionValues(s,k,z){
    const cutoff=[false,false,true,true][z];
    let physicalMoves=0,terminals=0;
    function recurse(st,d){
      if(d===k)return cutoff;
      const p=st.rank%2;
      let val=p===0?false:true;
      for(let c=0;c<W;c++)if(st.h[c]<H){
        const {state,term}=step(st,c);physicalMoves++;
        const x=term===0?true:term===1?false:term===2?(z===1||z===3):recurse(state,d+1);
        if(term!==null)terminals++;
        val=p===0?val||x:val&&x;
      }
      return val;
    }
    const out=[];
    for(let c=0;c<W;c++)if(s.h[c]<H){
      const {state,term}=step(s,c);physicalMoves++;
      out.push({column:c,truth:term===0?true:term===1?false:term===2?(z===1||z===3):recurse(state,1)});
    }
    return {out,physicalMoves,terminals};
  }
  function gatherSuffix(rank,count){
    const output=[],seen=new Set();let visits=0;
    function visit(s){
      if(output.length>=count||visits++>200000)return;
      if(s.rank===rank){
        const legal=s.h.filter(v=>v<H).length;
        const id=s.b.join('');
        if(legal>=2&&!seen.has(id)){output.push(s.history);seen.add(id);}return;
      }
      for(let c=0;c<W;c++)if(s.h[c]<H){
        const {state,term}=step(s,c);
        if(term===null)visit(state);
        if(output.length>=count)return;
      }
    }
    visit(initial());
    if(output.length<count)throw Error('not enough deterministic nonterminal suffix controls '+rank+'; found '+output.length);
    return {histories:output,visits};
  }
  function terminalCheck(s){return lines.some(line=>line.every(i=>s.b[i]===0)||line.every(i=>s.b[i]===1));}
  return {replay,step,fromPhysical,exactBoundedActionValues,gatherSuffix,terminalCheck};
}

const profile={width:7,height:6,connect:4},g=geometry(profile),sequence='44444',horizon=7;
const s=g.replay(sequence),q=g.fromPhysical(s),legal=q.h.flatMap((n,c)=>n<profile.height?[c]:[]);
const records=[];
for(let z=0;z<4;z++){
 const name=['Wlo','Nlo','Whi','Nhi'][z];
 const formula=compileGuardedActionQBF(profile,q,{horizon});
 const v=projectUnateWitnessFirstActionVector(formula.makeCNF(name),{legalColumns:legal});
 const physical=g.exactBoundedActionValues(s,horizon,z);
 if(v.status!=='EXACT_ACTION_VECTOR')throw Error('incomplete '+name);
 for(let i=0;i<physical.out.length;i++)if(v.actionValues[i].column!==physical.out[i].column||v.actionValues[i].threshold!==physical.out[i].truth)
  throw Error('physical k7 first-action threshold mismatch '+name+' '+i);
 records.push({name,producer:v.actionValues,physical:g.exactBoundedActionValues(s,horizon,z).out,
   physicalMoves:physical.physicalMoves,BooleanOps:v.stats.nontrivialOperations,peakNodes:v.stats.peakRetainedNodes,
   localizedUniversalConjunctions:v.stats.universalConjunctionPushes,
   localizedIndependentFactors:v.stats.independentFactorPushes,
   mixedFallbacks:v.stats.mixedFactorShannonFallbacks,
   extraCompaction:v.stats.compactionWorkUnits});
 console.error(name,'physical moves',physical.physicalMoves,'PASS');
}
console.log(JSON.stringify({schema:'connect4.shared-local-quantifier-k7-physical-falsification.v0_1',source:sequence,horizon,status:'PASS',records},null,2));
