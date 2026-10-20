// Source-only full original Connect4 K4 terminal DRAW coloring language.
// Counts ALL real nonwrapped K4-free full binary owner colorings, not just the
// alternating-column Fibonacci subclass. Counts player-balanced colorings
// extending an ORIGINAL firstwin-free partial q, when supplied.
// This is a WIDTH transfer with last3 FULL COLUMN-WORD states, not minimax
// search through future gameplay. Balanced static extensions are NECESSARY,
// not sufficient, for gravity/legal-alternating DRAW continuation.
// Does NOT import solved WDL scores, optimal28 masks or simulator packages.
import assert from "node:assert/strict";
const pop=x=>{let n=0;while(x){x&=x-1;n++;}return n;};
export function originalLines(W,H) {
 const out=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr,kind] of [[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]]){
  const a=Array.from({length:4},(_,i)=>[c+dc*i,r+dr*i]);
  if(a.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   out.push({kind,cells:a});
 }
 return out;
}
export function verticalSafeWords(H) {
 const r=[];
 for(let v=0;v<(1<<H);v++){
  let good=true;
  for(let s=0;s<=H-4;s++){
   const m=(v>>s)&15;
   if(m===0||m===15)good=false;
  }
  if(good)r.push(v);
 }
 return r;
}
export function compatible4Columns(a,b,c,d,H) {
 const mask=(1<<H)-1,short=(1<<(H-3))-1;
 if((a&b&c&d)!==0 || ((~a)&(~b)&(~c)&(~d)&mask)!==0)return false;
 const up=(a&(b>>>1)&(c>>>2)&(d>>>3))&short;
 const down=((a>>>3)&(b>>>2)&(c>>>1)&d)&short;
 if(up||down)return false;
 const zu=((~a)&((~b)>>>1)&((~c)>>>2)&((~d)>>>3))&short;
 const zd=(((~a)>>>3)&((~b)>>>2)&((~c)>>>1)&(~d))&short;
 return !(zu||zd);
}
export function originalStaticSafe(W,H,words) {
 const L=originalLines(W,H);
 return !L.some(({cells})=>{
  const [c0,r0]=cells[0],owner=(words[c0]>>>r0)&1;
  return cells.every(([c,r])=>((words[c]>>>r)&1)===owner);
 });
}
function candidatesForColumn(words,H,q,c){
 if(!q)return words.map((v,i)=>i);
 const out=[];
 for(let j=0;j<words.length;j++){
  let valid=true,v=words[j];
  for(let r=0;r<q.h[c];r++){
   const own=q.b[c][r];
   if(own!==0&&own!==1)throw Error("invalid source physical owner");
   if(((v>>>r)&1)!==own){valid=false;break;}
  }
  if(valid)out.push(j);
 }
 return out;
}
export function fullStaticDrawLanguage(W,H,q=null){
 assert.ok(W>=4&&H>=4&&H<=10&&W<=16);
 const words=verticalSafeWords(H),N=words.length;
 const weights=words.map(w=>H-pop(w));
 const columns=Array.from({length:W},(_,c)=>candidatesForColumn(words,H,q,c));
 if(q){
  assert.equal(q.h.reduce((a,v)=>a+v,0),q.n);
  assert.equal(q.W,W);assert.equal(q.H,H);
 }
 const summary={
  W,H,K:4,n:q?.n??0,columnWordAlphabetSize:N,
  candidateWordsPerPhysicalColumn:columns.map(x=>x.length),
  allStaticK4FreeFullOwnerColorings:0,
  balancedStaticK4FreeFullOwnerExtensions:0,
  totalP0RequiredOnFullDraw:Math.ceil(W*H/2)
 };
 if(columns.some(c=>c.length===0))return summary;
 const T=Math.ceil(W*H/2),stride=T+1,states=N*N*N;
 // original full-owner ternary labels can be represented in a bitmask
 // per completed column; the automaton's Q_H is EXACT nonwrapped K4 safety.
 const successor=Array(states);
 for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++){
  const state=(a*N+b)*N+c,out=[];
  for(let d=0;d<N;d++)
   if(compatible4Columns(words[a],words[b],words[c],words[d],H))
    out.push([((b*N+c)*N+d),d]);
  successor[state]=out;
 }
 let scalar=new Float64Array(states),coeff=new Float64Array(states*stride);
 for(const a of columns[0])for(const b of columns[1])for(const c of columns[2]){
  const state=(a*N+b)*N+c,weight=weights[a]+weights[b]+weights[c];
  scalar[state]+=1;if(weight<=T)coeff[state*stride+weight]++;
 }
 const compatibleSets=Array.from({length:W},(_,c)=>new Uint8Array(N));
 columns.forEach((arr,c)=>arr.forEach(v=>compatibleSets[c][v]=1));
 for(let index=3;index<W;index++){
  const newScalar=new Float64Array(states),newCoeff=new Float64Array(states*stride);
  const accept=compatibleSets[index];
  for(let st=0;st<states;st++){
   if(scalar[st]===0)continue;
   const row=successor[st],off=st*stride;
   for(let i=0;i<row.length;i++){
    const [to,d]=row[i];
    if(!accept[d])continue;
    newScalar[to]+=scalar[st];
    const w=weights[d],toOff=to*stride+w;
    for(let k=0;k+w<=T;k++)if(coeff[off+k])newCoeff[toOff+k]+=coeff[off+k];
   }
  }
  scalar=newScalar;coeff=newCoeff;
 }
 let total=0,balanced=0;
 for(let st=0;st<states;st++){
  total+=scalar[st];balanced+=coeff[st*stride+T];
 }
 // W<=8,H<=6 values bounded by 2^48 < IEEE integer exact range;
 // for larger boards, report >2^53 as non-exact unless BigInt variant.
 if(W*H>52)throw Error("unsafe unbounded Float64 exact count: use modular or BigInt");
 assert.ok(Number.isSafeInteger(total)&&Number.isSafeInteger(balanced));
 summary.allStaticK4FreeFullOwnerColorings=total;
 summary.balancedStaticK4FreeFullOwnerExtensions=balanced;
 return summary;
}
const testArgs=process.argv.slice(2);
if(testArgs.length&&testArgs[0]==="--regular"){
 const boards=[[5,5],[5,6],[6,6],[7,5],[7,6],[8,6]];
 for(const [W,H] of boards)console.log(JSON.stringify(fullStaticDrawLanguage(W,H)));
}else if(testArgs.length&&testArgs[0]==="--witness"){
 const word=testArgs[1]||"414121111222223333334444655555566666777777";
 const W=7,H=6,L=originalLines(W,H),q={W,H,n:0,h:Array(W).fill(0),b:Array.from({length:W},()=>Array(H).fill(-1))};
 let sawOwnerDouble=false;
 const ranks=new Set([0,1,2,3,5,9,15,21,27,31,35,39,42]);
 const out=[];
 for(let n=0;n<=word.length;n++){
  if(ranks.has(n))out.push(fullStaticDrawLanguage(W,H,q));
  if(n===word.length)break;
  const c=Number(word[n])-1;
  assert.ok(c>=0&&c<W&&q.h[c]<H);
  const r=q.h[c]++,p=n%2;
  if(r>0&&q.b[c][r-1]===p)sawOwnerDouble=true;
  q.b[c][r]=p;q.n++;
  assert.ok(!L.some(({cells})=>cells.every(([x,y])=>q.b[x][y]===p)));
 }
 assert.equal(q.n,42);assert.ok(sawOwnerDouble);
 console.log(JSON.stringify({historyOneBased:word,fullDraw:true,containsAdjacentSameOwnerInColumn:sawOwnerDouble,byRank:out},null,2));
}
