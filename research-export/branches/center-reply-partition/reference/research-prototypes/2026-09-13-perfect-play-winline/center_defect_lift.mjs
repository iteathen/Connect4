import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const lines=[];
for(let r=1;r<=H;r++)for(let c=1;c<=W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const L=[];
  for(let i=0;i<K;i++){
    const x=c+i*dx,y=r+i*dy;
    if(x<1||x>W||y<1||y>H){L.length=0;break;}
    L.push([x,y]);
  }
  if(L.length===K)lines.push(L);
}
assert.equal(lines.length,69);

const key=([c,r])=>`${c},${r}`;
const has=(L,x)=>L.some(y=>y[0]===x[0]&&y[1]===x[1]);
const hasPair=(L,P)=>P.every(x=>has(L,x));
const label=L=>L.map(([c,r])=>`${'ABCDEFG'[c-1]}${r}`).join('-');

const pairBlockers=[];
for(const r of [1,3,5])pairBlockers.push([[4,r],[5,r]]);
pairBlockers.push([[4,3],[4,4]],[[5,3],[5,4]]);

function uncovered(singletons){
  const S=new Set(singletons.map(key));
  return lines.filter(L=>!L.some(x=>S.has(key(x)))&&!pairBlockers.some(P=>hasPair(L,P)));
}

// Certificate field after D1 E1 A1 B1, after abandoning B-odd control and
// replacing the five diagonal blockers with Claimeven-style B4 and D4.
// A,C,F,G remain even-controlled; E1 and B1 are occupied by P1.
const reserved=[[5,1],[2,1],[2,4],[4,4]];
for(const c of [1,3,6,7])for(const r of [2,4,6])reserved.push([c,r]);

const U=uncovered(reserved);
assert.deepEqual(U.map(label),['A3-B3-C3-D3','A5-B5-C5-D5']);

const H3=U[0],H5=U[1];
const lower=x=>[x[0],x[1]-1];
const R=new Set(reserved.map(key));
const shadow5=H5.map(lower);
const shadow3=H3.map(lower);
assert(shadow5.every(x=>R.has(key(x))));
assert(!shadow3.every(x=>R.has(key(x))));
assert.deepEqual(shadow5.map(key),['1,4','2,4','3,4','4,4']);
assert.deepEqual(shadow3.map(x=>[key(x),R.has(key(x))]),[
  ['1,2',true],['2,2',false],['3,2',true],['4,2',false]
]);

// Every singleton cell of H3 is locally incompatible with the current
// unconditional singleton reservations: it is immediately adjacent in the
// same column to a reserved P1 ownership cell.
function adjacentReserved([c,r]){
  return R.has(key([c,r-1]))||R.has(key([c,r+1]));
}
const H3singletonRepair=H3.map(x=>({cell:key(x),adjacentReserved:adjacentReserved(x)}));
assert(H3singletonRepair.every(x=>x.adjacentReserved));

console.log(JSON.stringify({
  geometry:{W,H,K,winningLines:lines.length},
  transformedSafetyField:{
    reservedSingletons:reserved.map(key),
    uncoveredBeforeShadow:U.map(label)
  },
  supportShadow:{
    row5:{line:label(H5),lower:shadow5.map(key),preemptible:true},
    row3:{line:label(H3),lower:shadow3.map(x=>({cell:key(x),reserved:R.has(key(x))})),preemptible:false}
  },
  exactDefectAfterClosure:[label(H3)],
  row3SingletonRepair:H3singletonRepair,
  interpretation:'The richer B4/D4 repair transforms the five diagonal defects into two horizontals; support-shadow preemption removes row 5, leaving exactly A3-D3. Every unconditional singleton repair cell of A3-D3 conflicts locally with an inherited singleton reservation, so any repair must exchange certificates or use a pair/contingent response.'
},null,2));
