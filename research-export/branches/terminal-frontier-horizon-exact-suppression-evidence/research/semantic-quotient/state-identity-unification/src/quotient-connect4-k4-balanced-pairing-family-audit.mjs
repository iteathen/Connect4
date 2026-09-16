#!/usr/bin/env node
import assert from 'node:assert/strict';

const K=4,DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const zeros=(r,c)=>Array.from({length:r},()=>Array(c).fill(0));
const T=M=>M.length?Array.from({length:M[0].length},(_,c)=>M.map(r=>r[c])):[];
function rref(M){const a=M.map(r=>r.map(x=>x&1));let row=0,p=[];for(let col=0;col<(a[0]?.length??0)&&row<a.length;col++){let q=row;while(q<a.length&&!a[q][col])q++;if(q===a.length)continue;[a[row],a[q]]=[a[q],a[row]];for(let r=0;r<a.length;r++)if(r!==row&&a[r][col])for(let c=col;c<a[0].length;c++)a[r][c]^=a[row][c];p.push(col);row++;}return{a,pivots:p};}
const rank=M=>rref(M).pivots.length;
function nullBasis(M){const {a,pivots}=rref(M),n=a[0]?.length??0,ps=new Set(pivots),free=Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));return free.map(f=>{const v=Array(n).fill(0);v[f]=1;for(let r=0;r<pivots.length;r++){let b=0;for(const j of free)b^=a[r][j]&v[j];v[pivots[r]]=b;}return v;});}
function mul(A,B){if(!A.length||!B.length)return zeros(A.length,B[0]?.length??0);assert.equal(A[0].length,B.length);const o=zeros(A.length,B[0]?.length??0);for(let i=0;i<A.length;i++)for(let k=0;k<A[0].length;k++)if(A[i][k])for(let j=0;j<B[0].length;j++)o[i][j]^=B[k][j];return o;}
function independentCols(M){const pick=[];let rr=0;for(let c=0;c<(M[0]?.length??0);c++){const C=M.map(row=>[...pick.map(j=>row[j]),row[c]]),nr=rank(C);if(nr>rr){pick.push(c);rr=nr;}}return pick;}
function restrictedKernel(map,basisVectors){const C=T(basisVectors),coeff=nullBasis(mul(map,C));return coeff.map(a=>{const v=Array(C.length).fill(0);for(let j=0;j<a.length;j++)if(a[j])for(let i=0;i<C.length;i++)v[i]^=C[i][j];return v;});}
const key=a=>a.slice().sort((a,b)=>a-b).join(',');
function generateLines(W,H){const out=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){const cells=[];let ok=true;for(let i=0;i<K;i++){const xx=x+i*dx,yy=y+i*dy;if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}cells.push({x:xx,y:yy,cell:yy*W+xx});}if(ok)out.push({x,y,dx,dy,cells});}return out;}
function audit(W,H){
  const N=W*H,lines=generateLines(W,H),L=lines.length,B=zeros(N,L);
  lines.forEach((l,j)=>l.cells.forEach(p=>B[p.cell][j]=1));
  const rankB=rank(B),kerB=nullBasis(B),imageBasis=independentCols(B).map(j=>B.map(r=>r[j]));
  const col=zeros(W,N),row=zeros(H,N);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=y*W+x;col[x][c]=1;row[y][c]=1;}
  const Ycell=restrictedKernel([...col,...row],imageBasis),C=T(Ycell);
  const vertical=zeros(W,L);lines.forEach((l,j)=>{if(l.dx===0&&l.dy===1)vertical[l.x][j]=1;});
  const Yline=restrictedKernel(vertical,kerB),R=T(Yline);
  const c3Map=new Map();for(const l of lines)for(let d=0;d<K;d++){const s=l.cells.filter((_,i)=>i!==d).map(p=>p.cell);c3Map.set(key(s),s.slice().sort((a,b)=>a-b));}
  const c3=[...c3Map.values()],c3Index=new Map(c3.map((s,i)=>[key(s),i]));
  const D=zeros(c3.length,L);for(let j=0;j<L;j++)for(let d=0;d<K;d++){const s=lines[j].cells.filter((_,i)=>i!==d).map(p=>p.cell);D[c3Index.get(key(s))][j]^=1;}
  const DR=mul(D,R);
  function closure(s){const mx=Array(W).fill(-1);for(const cell of s){const x=cell%W,y=Math.floor(cell/W);mx[x]=Math.max(mx[x],y);}return mx.reduce((sum,r)=>sum+(r>=0?r+1:0),0);}
  const maxRow=s=>Math.max(...s.map(c=>Math.floor(c/W)));
  const cpcConstant=((W-1)*H)&1;
  const qResidual=s=>cpcConstant^(closure(s)&1)^(maxRow(s)&1);
  // Direct parity identity from N(t)=(W-1)H-ply+r+1 with prePly=C(S)-1.
  for(const s of c3){const Csize=closure(s),r=maxRow(s),eventCount=(W-1)*H-(Csize-1)+r+1;assert.equal(eventCount&1,qResidual(s));}
  const q=c3.map(qResidual),QDR=DR.map((r,i)=>r.map(v=>v&q[i]));
  const gamma=mul(T(DR),QDR),gammaRank=rank(gamma);
  function connected(line,deleted){const active=new Set(line.cells.filter(p=>p.cell!==deleted.cell).map(p=>p.cell));let components=0,on=false;for(const p of line.cells){if(active.has(p.cell)){if(!on)components++;on=true;}else on=false;}return components===1?1:0;}
  const A=zeros(N,L),Aq=zeros(N,L),Ac=zeros(N,L);
  for(let j=0;j<L;j++)for(const p of lines[j].cells){const s=lines[j].cells.filter(x=>x.cell!==p.cell).map(x=>x.cell);const qv=qResidual(s),cv=connected(lines[j],p);Aq[p.cell][j]=qv;Ac[p.cell][j]=cv;A[p.cell][j]=qv^cv;}
  const beta=mul(T(C),mul(A,R)),betaQ=mul(T(C),mul(Aq,R)),betaC=mul(T(C),mul(Ac,R));
  return {W,H,L,rankB,Ycell:Ycell.length,Yline:Yline.length,cpcConstantParity:cpcConstant,residualCount:c3.length,gammaRank,betaRank:rank(beta),betaQRank:rank(betaQ),betaConnectedRank:rank(betaC),perfect:Ycell.length===Yline.length&&gammaRank===Ycell.length&&rank(beta)===Ycell.length};
}
const balanced=[[5,9],[7,6],[13,5]].map(([W,H])=>audit(W,H));
assert.deepEqual(balanced.map(x=>[x.W,x.H,x.Ycell,x.Yline]),[[5,9,30,30],[7,6,28,28],[13,5,46,46]]);
assert.deepEqual(balanced.map(x=>[x.betaRank,x.gammaRank]),[[28,26],[28,28],[42,34]]);
assert.deepEqual(balanced.filter(x=>x.perfect).map(x=>[x.W,x.H]),[[7,6]]);
const transpose=[audit(7,6),audit(6,7)];
assert.deepEqual(transpose.map(x=>[x.Ycell,x.Yline,x.betaRank,x.gammaRank]),[[28,28,28,28],[28,29,23,14]]);
console.log(`K4_BALANCED_PAIRING_FAMILY=${JSON.stringify({proved:true,balanced,transpose,theoremBoundary:'Finite exact audit of the existing CPC/residual pairing on the three analytically balanced K=4 shapes. It proves the standard pairing is not a generic consequence of equal core dimensions. The generalized CPC residual parity includes ((W-1)H) mod 2; omitting it is invalid off boards where that constant is even.'})}`);
