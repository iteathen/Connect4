// Pure original W=6/7,H=6,K=4 four-ribbon physical K4 source.
 // Verify pre-registered third quartic cofactor, and Z4 gravity support
 // one-stone Fourier blind spot. No solver, historical lines, or game values.
import assert from 'node:assert/strict';

function makeLines(W){
 const dirs=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]],out=[];
 for(let c=0;c<W;c++)for(let r=0;r<6;r++)for(const [name,dx,dy] of dirs){
  const cells=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
  if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<6))
   out.push({direction:name,cells});
 }
 return out;
}
function calc(W){
 const L=makeLines(W),board=Array.from({length:6},()=>Array(W).fill(-1)),h=Array(W).fill(0);
 const triple=[[3,0],[4,0],[5,0]];
 const contains=(l,c,r)=>l.cells.some(([x,y])=>x===c&&y===r);
 const cofactor=L.filter(l=>triple.every(([c,r])=>contains(l,c,r))).map(l=>{
  const remaining=l.cells.filter(([c,r])=>!triple.some(([x,y])=>x===c&&y===r));
  assert.equal(remaining.length,1);
  return {direction:l.direction,cell:[remaining[0][0]+1,remaining[0][1]+1]};
 });
 function character(p){
  let re=0,im=0;
  for(const l of L){
   if(l.cells.some(([c,r])=>board[r][c]===1-p))continue;
   const R=l.cells.filter(([c,r])=>board[r][c]===-1),support=new Set;
   for(const [c,r] of R)for(let y=h[c];y<=r;y++)support.add(c+':'+y);
   const debt=support.size-R.length;
   if(debt%4===0)re++;else if(debt%4===1)im++;
   else if(debt%4===2)re--;else im--;
  }
  return [re,im];
 }
 const empty=character(0);
 board[0][3]=0;h[3]=1;
 const P0=character(0),P1=character(1),
  signed=P0.map((v,i)=>v-P1[i]);
 assert.equal(L.length,W===6?54:69);
 assert.deepEqual(empty,[0,W]);
 assert.deepEqual(signed,[3,0]);
 assert.deepEqual(cofactor,W===6?
  [{direction:'H',cell:[3,1]}]:
  [{direction:'H',cell:[3,1]},{direction:'H',cell:[7,1]}]);
 return {W,originalK4Windows:L.length,emptyZ4:empty,
  afterP0CenterSignedZ4:signed,
  originalQuarticThirdPhysicalCofactor:cofactor};
}
const report={schema:1,scope:'Original6x6 and7x6 K4, no solver input',
sourceQuartic:'W_W=SUM(all original H/V/R/F windows L) PRODUCT_(e in L) X_e',
thirdDerivative:'partial_(x4r1) partial_(x5r1) partial_(x6r1) W_W',
boards:[calc(6),calc(7)],
conclusion:'Initial single-site Z4 scalar 3 is blind to width-seven extra fork; original quartic third cofactor exposes x3 versus x3+x7.',
rootGameValueProof:false,
thirdPartyProofAssistant:false,maintainedNode26CI:false};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
