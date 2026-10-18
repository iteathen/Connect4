// Independently written ORIGINAL 7x6 physical GRID verifier for the first
// SOURCE-certified two-round endpoint equality vs unequal ROOT strategic WDL witness.
// Separate from the frozen candidate selector and bitboard minimax checker.
// The only recursive enumeration in this file is PHYSICAL VALIDATION.
// Run in Node26: node -e "import('./research/isograph/discovery/2026-10-18-unfolded-phase-race/standard7x6-diamond-counterexample-independent-reproducer.mjs').then(m=>console.log(JSON.stringify(m.reproduceOriginalDiamondCounterexample(),null,2)))"
export function reproduceOriginalDiamondCounterexample(){
 const history='2532541156412471331416356736376672';
 const originalA=[2,4,5,7],originalB=[5,7,2,4];
 const W=7,H=6, winlines=[], cell=(c,r)=>r*W+c;
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cc=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(cc.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   winlines.push(cc.map(([x,y])=>cell(x,y)));
 }
 if(winlines.length!==69)throw Error('not 69 original geometric K4 lines');
 function clone(q){return {b:q.b.slice(),h:q.h.slice(),n:q.n};}
 function hasWin(q,p){return winlines.some(L=>L.every(z=>q.b[z]===p));}
 function play(q,cOne){
  const c=cOne-1,p=q.n&1,r=q.h[c];
  if(!Number.isInteger(c)||c<0||c>=W||r>=H)throw Error('illegal gravity placement');
  const x=cell(c,r);q.b[x]=p;q.h[c]=r+1;q.n++;
  return {p,win:hasWin(q,p)};
 }
 const root={b:Array(42).fill(-1),h:Array(W).fill(0),n:0};
 for(const ch of history){if(play(root,Number(ch)).win)throw Error('prefix contains first win');}
 if(root.n!==34||JSON.stringify(root.h)!=='[6,4,6,4,4,6,4]')throw Error('invalid original history');
 function endpoint(word){
  const q=clone(root);
  for(const x of word)if(play(q,x).win)throw Error('a guarded diamond block contains early WIN');
  return q;
 }
 const A=endpoint(originalA),B=endpoint(originalB);
 if(JSON.stringify(A.h)!==JSON.stringify(B.h)||JSON.stringify(A.b)!==JSON.stringify(B.b))
  throw Error('two certified trace words do NOT end in the same ORIGINAL board');
 function residual(q,p){
  const bit=z=>1n<<BigInt(z),pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
  const raw=[];
  for(const L of winlines){
   if(L.some(z=>q.b[z]===1-p))continue;
   let mask=0n;for(const z of L)if(q.b[z]===-1)mask|=bit(z);
   if(mask===0n)throw Error('unexpected first winner during residual extraction');
   raw.push(mask);
  }
  const ordered=[...new Set(raw)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
  return ordered.filter((v,i)=>!ordered.slice(0,i).some(u=>(v&u)===u));
 }
 const qRoot=[residual(root,0).length,residual(root,1).length];
 const qEnd=[residual(A,0).length,residual(A,1).length];
 if(JSON.stringify(qRoot)!=='[4,3]'||JSON.stringify(qEnd)!=='[1,1]')
  throw Error('independent original source residual counts mismatch');
 let oracleCalls=0;const memo=new Map();
 function recurse(q){
  oracleCalls++;
  if(q.n===42)return 0;
  const key=q.b.join('');
  if(memo.has(key))return memo.get(key);
  const p=q.n&1;
  let result=p===0?-1:+1,hasLegal=false;
  for(let c=1;c<=W;c++){
   if(q.h[c-1]===H)continue;hasLegal=true;
   const next=clone(q),out=play(next,c);
   const score=out.win?(p===0?+1:-1):recurse(next);
   if(p===0)result=Math.max(result,score);
   else result=Math.min(result,score);
   if(result===(p===0?1:-1))break;
  }
  if(!hasLegal)result=0;
  memo.set(key,result);return result;
 }
 function values(q){
  const p=q.n&1,v={};
  for(let c=1;c<=7;c++)if(q.h[c-1]<6){
   const child=clone(q),t=play(child,c);
   v[c]=t.win?(p===0?1:-1):recurse(child);
  }
  return v;
 }
 const firstValues=values(root);
 if(JSON.stringify(firstValues)!=='{"2":-1,"4":-1,"5":0,"7":-1}')
  throw Error('independent physical WDL first-action values contradict original frozen witness');
 const after={};
 for(const c of [2,5]){const next=clone(root);const out=play(next,c);
  if(out.win)throw Error('early first WIN unexpected on chosen root first action');
  after[c]=values(next);
 }
 if(after[2][4]!==-1||after[5][4]!==0||after[5][7]!==1)
  throw Error('critical P1 response-value topology changed');
 return {
  status:'INDEPENDENT_ORIGINAL_69_WINLINE_GRID_PHYSICAL_CONFIRMATION_PASS',
  history,ply:root.n,heights:root.h,
  sourceOriginalRCounts:qRoot,originalSameQEndpointRCounts:qEnd,
  originalWordA:originalA,originalWordB:originalB,
  physicalColoredEndBoardsIdentical:true,zeroFirstWinsInsideBothFourPlyBlocks:true,
  exactPhysicalRootFirstActionValuesP0Relative:firstValues,
  exactPhysicalRootWDL:0,uniqueBestLiteralOriginalColumn:5,
  originalP1ResponsesAfterP0Column2:after[2],
  originalP1ResponsesAfterP0Column5:after[5],
  exactPhysicalMemoStates:memo.size,independentPhysicalRecursiveCalls:oracleCalls,
  sourceAlternativeFutureGameValuesComputed:0,
  note:'Endpoint q equivalence does not transport adaptive opponent policies; this is independent physical validation, not source best-move computation.'
 };
}
