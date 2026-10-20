import fs from 'node:fs';
import assert from 'node:assert/strict';

// Research-only original W=7,H=6,K=4 physical falsifier. No game search.
const f=JSON.parse(fs.readFileSync(new URL('./STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json',import.meta.url),'utf8'));
const s=x=>x.map(z=>z.join(',')).sort().join('|');
const dirs=[[1,0],[0,1],[1,1],[1,-1]], all=[];
for(let c=0;c<7;c++)for(let r=0;r<6;r++)for(const [dc,dr] of dirs){
 const a=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
 if(a.every(([x,y])=>x>=0&&x<7&&y>=0&&y<6))all.push(a);
}
assert.equal(all.length,69);
const windows=new Set(all.map(s)), w=f.witnesses.sort((a,b)=>a.lineId-b.lineId);
assert.equal(w.length,28);
let replayed=0;
for(const v of w){
 assert.equal(v.movesZeroBased.length,41);
 assert.ok(windows.has(s(v.cells)));
 const b=Array.from({length:7},()=>Array(6).fill(-1)),h=Array(7).fill(0);
 let first=0,complete=[];
 for(let t=0;t<41;t++){
  const c=+v.movesZeroBased[t];assert.ok(c>=0&&c<7&&h[c]<6);
  b[c][h[c]++]=t%2;replayed++;
  complete=all.filter(l=>l.every(([x,y])=>b[x][y]===t%2));
  if(complete.length){first=t+1;break;}
 }
 assert.equal(first,41);assert.ok(complete.some(x=>s(x)===s(v.cells)));
}
assert.equal(replayed,1148);
const F=new Set(Array.from({length:7},(_,c)=>[[c,4],[c,5]]).flat().filter(([c,r])=>!(c===3&&r===4)).map(x=>x.join(',')));
const T=all.filter(l=>l.some(x=>F.has(x.join(',')))&&!l.some(([c,r])=>c===3&&(r===1||r===3)));
assert.equal(T.length,28);assert.deepEqual(new Set(T.map(s)),new Set(w.map(x=>s(x.cells))));
const ids=w.map(x=>x.lineId),byId=new Map(w.map(x=>[x.lineId,new Set(x.cells.map(z=>z.join(',')))]));
const E=[];
for(let i=0;i<28;i++)for(let j=i+1;j<28;j++){
 if([...byId.get(ids[i])].some(x=>F.has(x)&&byId.get(ids[j]).has(x)))E.push([ids[i],ids[j]]);
}
assert.equal(E.length,102);
const nei=new Map(ids.map(id=>[id,new Set()]));
for(const [a,b] of E){nei.get(a).add(b);nei.get(b).add(a);}
const q=[ids[0]],seen=new Set(q),tree=[];
for(let i=0;i<q.length;i++)for(const b of [...nei.get(q[i])].sort((a,b)=>a-b))if(!seen.has(b)){seen.add(b);q.push(b);tree.push([q[i],b]);}
assert.equal(seen.size,28);assert.equal(tree.length,27);
const rank2=rows=>{const piv=new Map();for(let x of rows){while(x){const k=x.toString(2).length-1;if(piv.has(k))x^=piv.get(k);else{piv.set(k,x);break;}}}return piv.size;};
const diffs=E.map(([a,b])=>(1n<<BigInt(ids.indexOf(a)))^(1n<<BigInt(ids.indexOf(b))));
assert.equal(rank2(diffs),27);
const B=Array.from({length:42},(_,i)=>{const cell=Math.floor(i/6)+','+(i%6);return ids.reduce((x,id,j)=>x|(BigInt(byId.get(id).has(cell)?1:0)<<BigInt(j)),0n);});
assert.equal(rank2(B),26);
const wordCount=new Set(w.map(v=>v.movesZeroBased)).size;assert.equal(wordCount,27);
const dftNonzero=Array.from({length:81},(_,x)=>{
 const k=[x%3,Math.floor(x/3)%3,Math.floor(x/9)%3,Math.floor(x/27)%3];
 return (k[0]+k[1]+k[2]+k[3])%3===0;
}).filter(Boolean).length;
assert.equal(dftNonzero,27);
console.log(JSON.stringify({originalWindows:69,physicalWitnessMoves:replayed,strongLineNodes:28,distinctHistoricalWitnessWords:27,physicalLandingSites:13,sharedLineEdges:102,connectedComponents:1,graphCoboundaryRankGF2:27,treeEdges:tree,originalCellIncidenceRankGF2:26,localZ3AllowedChargeTuples:27,noNewWDLProof:true},null,2));
