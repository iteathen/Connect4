// Research-only invariant probes. No maintained implementation changes.
// Run from any directory: node .../invariant_probe.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { cpus, availableParallelism } from 'node:os';
const sourceURL = new URL('../2026-09-08-exact-solver/twoword_solver_sharedtt.mjs', import.meta.url);
const source = readFileSync(sourceURL);
const blob = createHash('sha1').update(`blob ${source.length}\0`).update(source).digest('hex');
assert.equal(blob, '965c3806c92a7add544dce4777d965b3e12376d6');
const { Solver } = await import(sourceURL.href);
const emit = x => console.log(JSON.stringify(x));
emit({kind:'environment',node:process.version,arch:process.arch,platform:process.platform,cpu:cpus()[0]?.model,availableParallelism:availableParallelism(),sourceCommit:'990686a094acaddc0bc37d0995759ab138d63aa4',sourceBlob:blob});

// Independent cell-array game mechanics and exhaustive late-game oracle.
function empty(){ return {board:new Int8Array(42),height:new Uint8Array(7),moves:0,seq:''}; }
function winner(s,c,r,p){
  for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
    let count=1;
    for(const sign of [-1,1]){
      for(let k=1;k<4;k++){
        const x=c+k*dc*sign,y=r+k*dr*sign;
        if(x<0||x>=7||y<0||y>=6||s.board[x*6+y]!==p)break;
        count++;
      }
    }
    if(count>=4)return true;
  }
  return false;
}
function immediate(s){
  const p=(s.moves&1)+1;
  for(let c=0;c<7;c++){
    const r=s.height[c]; if(r===6)continue;
    s.board[c*6+r]=p;const win=winner(s,c,r,p);s.board[c*6+r]=0;
    if(win)return true;
  }
  return false;
}
function parse(seq){
  const s=empty();
  for(const ch of seq){
    const c=ch.charCodeAt(0)-49,p=(s.moves&1)+1,r=s.height[c];
    assert(c>=0&&c<7&&r<6);s.board[c*6+r]=p;s.height[c]++;
    assert(!winner(s,c,r,p),'input ends at or crosses a terminal win');
    s.moves++;s.seq+=ch;
  }
  return s;
}
function words(s){
  let cLo=0,cHi=0,mLo=0,mHi=0;const p=(s.moves&1)+1;
  for(let c=0;c<7;c++)for(let r=0;r<s.height[c];r++){
    const k=c*7+r,b=1<<(k&31),mine=s.board[c*6+r]===p;
    if(k<32){mLo|=b;if(mine)cLo|=b;}else{mHi|=b;if(mine)cHi|=b;}
  }
  return [cLo>>>0,cHi>>>0,mLo>>>0,mHi>>>0,s.moves];
}
let oracleNodes=0;
function exact(s){
  oracleNodes++;if(s.moves===42)return 0;
  const p=(s.moves&1)+1;let best=-22;
  for(let c=0;c<7;c++){
    const r=s.height[c];if(r===6)continue;
    s.board[c*6+r]=p;s.height[c]++;
    let score;
    if(winner(s,c,r,p))score=Math.trunc((43-s.moves)/2);
    else{s.moves++;score=-exact(s);s.moves--;}
    s.height[c]--;s.board[c*6+r]=0;if(score>best)best=score;
  }
  return best;
}
let seed=0x8c351a29;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
function randomLate(){
  const s=empty();
  for(let i=0;i<35;i++){
    const start=random()%7,p=(s.moves&1)+1;let found=false;
    for(let j=0;j<7;j++){
      const c=(start+j)%7,r=s.height[c];if(r===6)continue;
      s.board[c*6+r]=p;
      if(winner(s,c,r,p)){s.board[c*6+r]=0;continue;}
      s.height[c]++;s.moves++;s.seq+=c+1;found=true;break;
    }
    if(!found)return null;
  }
  return s;
}
let cases=0,windowChecks=0,exactNodes=0,oracleTotal=0,nonExactReturns=0;
const sample=[];const seen=new Set();
for(let tries=0;cases<48&&tries<5000;tries++){
  const s=randomLate();if(!s||seen.has(s.seq))continue;seen.add(s.seq);
  oracleNodes=0;const want=exact(s);oracleTotal+=oracleNodes;
  const solver=new Solver(15,false,0),bits=words(s);
  const got=solver.solveBits(...bits);assert.equal(got,want);exactNodes+=solver.nodes;
  cases++;
  // Internal negamax requires no immediate current-player win at its entry.
  if(!immediate(s))for(let alpha=-4;alpha<=4;alpha++){
    const r=new Solver(10,false,0).negamax(...bits,alpha,alpha+1);
    // Validate fail-soft direction and sound bounds, not raw result equality.
    assert.equal(r<=alpha,want<=alpha);
    if(r<=alpha)assert(want<=r);else assert(want>=r);
    if(r!==want)nonExactReturns++;windowChecks++;
  }
  if(sample.length<5)sample.push({seq:s.seq,score:want});
}
assert.equal(cases,48);
emit({kind:'independentLateGameOracle',cases,windowChecks,nonExactReturns,oracleNodes:oracleTotal,solverExactNodes:exactNodes,sample});

const guard=parse('121212'),guardBits=words(guard);
assert(immediate(guard));
const wrapped=new Solver(15,false,0).solveBits(...guardBits);
const internal=new Solver(15,false,0).negamax(...guardBits,17,18);
assert.equal(wrapped,18);assert.equal(internal,17);
emit({kind:'internalEntryPrecondition',seq:guard.seq,independentImmediateScore:18,solveBits:wrapped,rawNegamaxWindow:[17,18],rawNegamaxResult:internal,meaning:'Internal no-immediate-win precondition is essential; not a counterexample on valid internal entries.'});

const boundSolver=new Solver(4,false,0),key=[73,1],slot=boundSolver.hash(...key);
boundSolver.publish(slot,...key,3+56);const lower3=boundSolver.val[slot];
boundSolver.publish(slot,...key,1+56);const lower1=boundSolver.val[slot];
boundSolver.publish(slot,...key,3+19);const upper3=boundSolver.val[slot];
assert.deepEqual([lower3,lower1,upper3],[59,57,22]);
emit({kind:'sameKeyProofRetention',storedBytes:[lower3,lower1,upper3],decoded:['lower >=3','lower >=1','upper <=3'],meaning:'Valid weaker bound overwrites stronger bound; single-byte entry cannot retain both lower and upper. Improvement opportunity, not wrong score.'});

// A possible future full-key, interval+hint word. Encoding only, not a TT implementation.
const pack=(hi,lo,up,hint)=>(hi|(lo<<17)|(up<<23)|(hint<<29))>>>0;
const check=(hi,lo,up,hint)=>{
  const p=pack(hi,lo,up,hint);
  assert.equal(p&0x1ffff,hi);assert.equal((p>>>17)&63,lo);
  assert.equal((p>>>23)&63,up);assert.equal(p>>>29,hint);
};
let encodings=0;
for(let hi=0;hi<=0x1ffff;hi++){check(hi,0,37,7);encodings++;}
for(const hi of [0,1,0x10000,0x1ffff])for(let lo=0;lo<=37;lo++)for(let up=0;up<=37;up++)for(let hint=0;hint<8;hint++){check(hi,lo,up,hint);encodings++;}
// Per column, a legal gravity mask m=2^h-1 and current p<=m gives p+m<=126.
let maxDigit=0;
for(let h=0;h<=6;h++){const m=(1<<h)-1;for(let p=0;p<=m;p++){assert(p+m<128);maxDigit=Math.max(maxDigit,p+m);}}
emit({kind:'packedWordEncoding',roundTrips:encodings,maxColumnKeyDigit:maxDigit,keyBits:49,wordLayout:{keyHi:17,lowerCode:6,upperCode:6,moveHint:3},entryBytesWithKeyLoAndControl:12,baselineEntryBytes:14,meaning:'Exact bit-field capacity proven for this specialized encoding; concurrency, search effect and speed not qualified.'});

// No-copy parent split preserves a hash-addressed half, but does NOT purify dependency ownership.
const a=parse('412675753'),b=parse('4126757563');
let contrary=[];
for(let c=0;c<7;c++)for(let r=0;r<6;r++){
 const av=a.board[c*6+r],bv=b.board[c*6+r];
 if(av&&bv&&av!==bv)contrary.push({column:c,row:r,aOwner:av-1,bOwner:bv-1});
}
assert(contrary.length>0);
const bBits=words(b),sum=bBits[0]+bBits[2],kLo=sum>>>0,kHi=(bBits[1]+bBits[3]+(sum>=2**32?1:0))>>>0;
const table=new Solver(16,false,0),oldSlot=table.hash(kLo,kHi),half=1<<15;
table.publish(oldSlot,kLo,kHi,22);
const offset=oldSlot&half,newSlot=oldSlot&(half-1);
assert.equal(table.keyLo[offset+newSlot],kLo);assert.equal(table.keyHi[offset+newSlot],kHi);
emit({kind:'retainedBytesScope',aSeq:a.seq,bSeq:b.seq,contradictions:contrary,retainedBSlot:oldSlot,newHalfOffset:offset,newLocalSlot:newSlot,meaning:'If a retained parent half is assigned A-only future writers, B bytes can remain. Future routing label is not a proof of all resident entries. This synthetic retained-entry witness does not claim the full benchmark encountered that slot.'});

for(const [seq,want] of [['663152175',-4],['41267575',3]]){
 const bits=words(parse(seq)),solver=new Solver(19,false,0),start=performance.now();
 const score=solver.solveBits(...bits);assert.equal(score,want);
 emit({kind:'preservedPositionConsistency',seq,score,expected:want,nodes:solver.nodes,seconds:(performance.now()-start)/1000,ttHits:solver.ttHits,meaning:'Same-kernel consistency against preserved expected root score; not an independent oracle for this early position or a speed comparison.'});
}
emit({kind:'result',status:'PASS',performanceClaim:false,concurrentQualification:false});
