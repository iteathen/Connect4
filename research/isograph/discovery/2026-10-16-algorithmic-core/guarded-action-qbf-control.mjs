#!/usr/bin/env node
// Independent physical first-win and complete finite-horizon controls.
// Only the validator explores proposed move words and searched game states.
import {compileGuardedActionQBF} from './guarded-action-qbf.mjs';
const profiles=[
  {board:{width:4,height:3,connect:3},seeds:['','2','223','1212','1234'],depths:[1,2,3,4]},
  {board:{width:4,height:4,connect:4},seeds:['','223','121212','1234'],depths:[1,2,3,4]},
  {board:{width:7,height:6,connect:4},seeds:['44444','444444','4444414','121212'],depths:[1,2,3,4]}
];
const named=['Wlo','Nlo','Whi','Nhi'];
const cutoffs=[false,false,true,true];
const outcome=p=>p===0?[true,true,true,true]:[false,false,false,false];
const draw=[false,true,false,true];
let deadline=Date.now()+45000;
function geometry({width:W,height:H,connect:K}){
  const dirs=[[1,0],[0,1],[1,1],[1,-1]],lines=[];
  for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of dirs){
    if(c+(K-1)*dc<0||c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
    lines.push(Array.from({length:K},(_,j)=>(r+j*dr)*W+c+j*dc));
  }
  const bit=i=>1n<<BigInt(i);
  function won(board,p){return lines.some(line=>line.every(i=>board[i]===p));}
  function empty(){return {board:Array(W*H).fill(-1),h:Array(W).fill(0),rank:0};}
  function attempt(state,c){
    if(!Number.isInteger(c)||c<0||c>=W||state.h[c]===H)return {invalid:true};
    const b=state.board.slice(),h=state.h.slice(),p=state.rank%2;
    b[h[c]*W+c]=p;h[c]++;
    const rank=state.rank+1,term=won(b,p)?p:rank===W*H?2:null;
    return {state:{board:b,h,rank},term};
  }
  function replay(prefix){
    let s=empty();
    for(const ch of prefix){
      const next=attempt(s,Number(ch)-1);
      if(next.invalid||next.term!==null)throw Error('terminal or illegal fixture prefix '+prefix);
      s=next.state;
    }
    return s;
  }
  function residuals(s){
    return [0,1].map(p=>{
      const raw=[];
      for(const line of lines){
        if(line.some(i=>s.board[i]===1-p))continue;
        const left=line.filter(i=>s.board[i]===-1);
        if(!left.length)throw Error('terminal source leaked');
        raw.push(left.reduce((acc,i)=>acc|bit(i),0n));
      }
      const dedup=[...new Set(raw.map(String))].map(BigInt);
      return dedup.filter(a=>!dedup.some(b=>a!==b&&(b&a)===b));
    });
  }
  function evaluateWord(s,word,first=null){
    let state=s;
    if(first!==null&&word[0]!==first){
      const v=state.rank%2===0?false:true;
      return [v,v,v,v];
    }
    for(const c of word){
      const p=state.rank%2,next=attempt(state,c);
      if(next.invalid){const n=p===0?false:true;return [n,n,n,n];}
      if(next.term===0||next.term===1)return outcome(next.term);
      if(next.term===2)return draw;
      state=next.state;
    }
    return cutoffs;
  }
  function exactPhysicalThreshold(s,k,z,first=null){
    function walk(state,remaining){
      if(!remaining)return cutoffs[z];
      const p=state.rank%2;
      if(first!==null&&remaining===k){
        const next=attempt(state,first);
        if(next.invalid)throw Error('illegal fixed root');
        return next.term===0||next.term===1?outcome(next.term)[z]:
          next.term===2?draw[z]:walk(next.state,remaining-1);
      }
      let val=p===0?false:true;
      for(let c=0;c<W;c++){
        const next=attempt(state,c);if(next.invalid)continue;
        const v=next.term===0||next.term===1?outcome(next.term)[z]:
          next.term===2?draw[z]:walk(next.state,remaining-1);
        val=p===0?(val||v):(val&&v);
      }
      return val;
    }
    return walk(s,k);
  }
  return {replay,residuals,attempt,evaluateWord,exactPhysicalThreshold};
}
const statistics={status:'PASS',profileCases:[],candidateBuilds:0,
  compiledThresholdCNFs:0,completeActionWordControls:0,
  individualThresholdComparisons:0,quantifierRootComparisons:0,
  clauseTruthChecks:0,stagedPostfixWidthRecords:[],
  largestRawCNFVariables:0,largestCNFClauses:0,
  largestPathWidthUpperBound:0,candidateGateOperations:0,
  candidateGameContinuationsEnumerated:0,independentPhysicalBranches:0,
  failures:[],runtime:'Node 22.16.0 direct local run',
  sourceProducerUsedOracle:false};
function testCase(profile,seq,k,first=null){
  const g=geometry(profile),s=g.replay(seq),[R0,R1]=g.residuals(s),
    q={h:s.h,R0,R1};
  const data=compileGuardedActionQBF(profile,q,{horizon:k,fixedFirstAction:first,maxMs:15000});
  statistics.candidateBuilds++;statistics.candidateGateOperations+=data.records.stats.operations;
  if(data.records.stats.gameContinuationsEnumerated!==0)throw Error('candidate continuation enumeration');
  const Ws=profile.width,bits=data.records.bitsPerAction,choices=1<<bits;
  let sampleCNF;
  for(const mode of ['staged','postfix'])for(const name of named){
    const cnf=data.makeCNF(name,{auxMode:mode});
    statistics.compiledThresholdCNFs++;
    if(!sampleCNF)sampleCNF=cnf;
    if(cnf.variables>60000||cnf.verifiedBilateralWidthUpperBound<0)
      throw Error('invalid CNF/bilateral decomposition size');
    statistics.largestRawCNFVariables=Math.max(statistics.largestRawCNFVariables,cnf.variables);
    statistics.largestCNFClauses=Math.max(statistics.largestCNFClauses,cnf.clauses.length);
    statistics.largestPathWidthUpperBound=Math.max(statistics.largestPathWidthUpperBound,cnf.verifiedBilateralWidthUpperBound);
    statistics.stagedPostfixWidthRecords.push({board:profile.width+'x'+profile.height+'-c'+profile.connect,
      history:seq,k,first,mode,threshold:name,variables:cnf.variables,
      clauses:cnf.clauses.length,edges:cnf.primalEdges,
      forwardWidth:cnf.forwardTrunkAlignedP2.width,
      reverseWidth:cnf.reverseTrunkAlignedP1.width,
      bilateralUpper:cnf.verifiedBilateralWidthUpperBound});
  }
  const cnfs=Object.fromEntries(named.map(name=>[name,data.makeCNF(name,{auxMode:'staged'})]));
  const setWord=Array(k).fill(0),trace=Array(4).fill(null).map(()=>[]);
  for(let raw=0;raw<choices**k;raw++){
    let num=raw;
    for(let t=0;t<k;t++){setWord[t]=num%choices;num=Math.floor(num/choices);}
    const word=setWord.slice(),act=data.evaluateActionWord(word),direct=g.evaluateWord(s,word,first);
    statistics.completeActionWordControls++;
    for(let z=0;z<4;z++){
      if(act.thresholds[named[z]]!==direct[z])throw Error('physical threshold mismatch '+JSON.stringify({profile,seq,k,first,word,z,actual:act.thresholds,expected:direct}));
      statistics.individualThresholdComparisons++;
      const cnf=cnfs[named[z]];
      for(const clause of cnf.clauses){
        statistics.clauseTruthChecks++;
        const satisfied=clause.some(lit=>lit>0?act.values[lit]:!act.values[-lit]);
        if(!satisfied&&!(!direct[z]&&clause.length===1))throw Error('CNF gate or output mismatch');
      }
    }
    for(let z=0;z<4;z++)trace[z].push(direct[z]);
  }
  // QBF oracle is an independent full physical finite-horizon recurrence.
  for(let z=0;z<4;z++){
    const ref=g.exactPhysicalThreshold(s,k,z,first);
    function Q(depth,offset,stride){
      if(depth===k)return trace[z][offset];
      const p=(s.rank+depth)%2;
      let val=p===0?false:true;
      for(let a=0;a<choices;a++){
        const v=Q(depth+1,offset+a*stride,stride*choices);
        val=p===0?(val||v):(val&&v);
      }
      return val;
    }
    const actual=Q(0,0,1);
    if(actual!==ref)throw Error('QBF scope mismatch '+JSON.stringify({profile,seq,k,first,z,actual,ref}));
    statistics.quantifierRootComparisons++;
  }
  statistics.profileCases.push({board:profile.width+'x'+profile.height+'-c'+profile.connect,
    source:seq,rank:s.rank,k,first,results:named.map((n,z)=>g.exactPhysicalThreshold(s,k,z,first)),
    stageCNFVars:sampleCNF.variables,stageCNFClauses:sampleCNF.clauses.length,
    stageBilateralUpper:sampleCNF.verifiedBilateralWidthUpperBound,
    sourceAntichains:[R0.length,R1.length],stats:data.records.stats});
}
for(const p of profiles){
  for(const seq of p.seeds){
    const g=geometry(p.board),s=g.replay(seq);
    for(const k of p.depths){
      if(k>p.board.width*p.board.height-s.rank)continue;
      testCase(p.board,seq,k);
      // Literal first action checks: one P0 and one P1 source fixture.
      if(k===2||k===3){
        const first=s.h.findIndex(h=>h<p.board.height);
        if(first>=0)testCase(p.board,seq,k,first);
      }
    }
  }
}
statistics.stagedPostfixWidthRecords=statistics.stagedPostfixWidthRecords.filter(x=>x.threshold==='Wlo');
statistics.dataInterpretation='Independent physical enumeration occurs only inside the falsifier; no candidate recursion; true bilateral path upper bounds only';
console.log(JSON.stringify(statistics,null,2));
