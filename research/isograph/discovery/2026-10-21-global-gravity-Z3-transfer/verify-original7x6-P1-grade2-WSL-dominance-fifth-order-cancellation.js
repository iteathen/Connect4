/**
 * Exact source-7x6 two P1 observable fifth-order cancellation.
 * Physically checks original P1 rising grade2 after a live P0 center,
 * and pre-action historical WSL dominance by a P1 horizontal singleton.
 * Independent original ternary arrays, literal 69 windows, separate ray,
 * Boolean-lattice five-bit Mobius transform. No solved outcome data.
 * Run: node verify-original7x6-P1-grade2-WSL-dominance-fifth-order-cancellation.js
 */
"use strict";
const W=7,H=6,outer=[1,2,3,5,6,7],free=[1,2,3,5,6],dirs=[[1,0],[0,1],[1,1],[1,-1]];
const ok=(c,m)=>{if(!c)throw Error("C4_P1_FIFTH_ORDER "+m);};
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dc,dr]of dirs){
 let cells=[];for(let k=0;k<4;k++){const cc=c+k*dc,rr=r+k*dr;if(cc<0||cc>=W||rr<0||rr>=H){cells=[];break;}cells.push(rr*W+cc);}
 if(cells.length===4)lines.push(cells);
}
ok(lines.length===69,"original 69");
function ray(q,c,r,p) {
 for(const[dx,dy]of dirs){
  let n=1;for(const side of [-1,1])for(let step=1;step<4;step++){
   const x=c+side*dx*step,y=r+side*dy*step;
   if(x<0||x>=W||y<0||y>=H||q.b[y*W+x]!==p)break;n++;
  }if(n>=4)return true;
 }return false;
}
function move(q,c,p){
 const col=c-1,row=q.h[col];ok(row<H,"gravity landing");
 const b=q.b.slice(),h=q.h.slice();b[row*W+col]=p;h[col]++;
 const child={b,h};const w=ray(child,col,row,p);
 ok(w===lines.some(L=>L.every(i=>b[i]===p)),"ray/K4 agree");
 ok(!lines.some(L=>L.every(i=>b[i]===1-p)),"parent must be nonterminal");
 return {child,win:w};
}
function source(id){
 const bits=free.map((_,i)=>(id>>(4-i))&1);
 const seq=[7,...free.flatMap((c,i)=>bits[i]?[ ]:[c,c]),7,...free.flatMap((c,i)=>bits[i]?[c,c]:[])];
 ok(seq.length===12,"genuine 12-ply source");
 let q={b:Array(42).fill(-1),h:Array(7).fill(0)};
 for(let ply=0;ply<12;ply++){const next=move(q,seq[ply],ply&1);ok(!next.win,"legal firstwin-free history");q=next.child;}
 ok(q.h.join(",")==="2,2,2,0,2,2,2","authentic gravity rank12");
 return {q,bits};
}
function minimalP1(q){
 let unique=new Map();
 for(const L of lines){
  if(L.some(i=>q.b[i]===0))continue;
  const cells=L.filter(i=>q.b[i]===-1);
  ok(cells.length>0,"P1 terminal impossible at live source");
  unique.set(cells.join(","),cells);
 }
 const u=[...unique.values()],m=u.filter(a=>!u.some(b=>b.length<a.length&&b.every(i=>a.includes(i))));
 return {unique:u,minimal:m};
}
const diag=[3,2*W+5,3*W+6].join(",");
const rising=[0,1*W+1,2*W+2,3*W+3];
const pop=id=>{let n=0;while(id){n+=id&1;id>>=1;}return n;};
const fields={gS:[],DS:[],U:[],D:[],g:[],W:[]};
const parity={EVEN:{gS:0,DS:0,U:0,D:0},ODD:{gS:0,DS:0,U:0,D:0}};
const survivorIndices={gS:[],DS:[],U:[]};
for(let id=0;id<32;id++){
 const {q,bits}=source(id),[x1,x2,x3,x5,x6]=bits;
 const req=minimalP1(q);
 const D=Number(req.unique.some(m=>m.join(",")===diag)&&!req.minimal.some(m=>m.join(",")===diag));
 ok(D===x5*(1-x1)*(1-x2)*(1-x3),"historical WSL dominance exact");
 const next=move(q,4,0),S=Number(!next.win);
 const A=x1*x2*x3,B=x2*x3*x5,DD=x5*x6;
 ok(Number(next.win)===A+B+DD-A*B-B*DD,"true four-way Euler H-center reduction");
 // Genuine P1 rising original line keeps exactly two P1 owner sites
 // and the other two unowned after actual P0 center.
 const line=lines.find(x=>x.join(",")===rising.join(","));
 ok(Boolean(line),"original rising grade2 K4 physically exists");
 const gAfter=Number(line.every(i=>next.child.b[i]!==0)&&line.filter(i=>next.child.b[i]===1).length===2);
 const g=(1-x1)*x2;ok(gAfter===g,"postaction original rising grade2");
 const gs=g*S,ds=D*S,u=gs+ds;ok(g*D===0&&u<=1,"source sectors mutually exclusive");
 ok(gs===(1-x1)*x2*(1-x5*x6)*(1-x3*x5),"October gS factor identity");
 ok(ds===(1-x6)*x5*(1-x1)*(1-x2)*(1-x3),"WSL DS factor identity");
 if(S){const after=minimalP1(next.child);ok(!after.unique.some(m=>m.join(",")===diag),"P0 center blocks historical P1 diagonal");}
 Object.entries({gS:gs,DS:ds,U:u,g,D,W:Number(next.win)}).forEach(([k,v])=>fields[k].push(v));
 const p=(pop(id)&1)?"ODD":"EVEN";for(const[k,v]of Object.entries({gS:gs,DS:ds,U:u,D}))parity[p][k]+=v;
 for(const k of ["gS","DS","U"])if(fields[k][fields[k].length-1])survivorIndices[k].push(id);
}
function mobius(coefficients){
 const out=coefficients.slice();
 for(let i=0;i<5;i++)for(let id=0;id<32;id++)if(id&(1<<i))out[id]-=out[id^(1<<i)];
 const terms=out.flatMap((v,id)=>v?[{mask:id,degree:pop(id),coefficient:v}]:[]);
 return {degree:Math.max(...terms.map(x=>x.degree)),topFive:out[31],nonzeroTerms:terms.length,terms};
}
const poly={gS:mobius(fields.gS),DS:mobius(fields.DS),U:mobius(fields.U)};
ok(poly.gS.degree===5&&poly.gS.topFive===-1,"grade2 survivor fifth order -1");
ok(poly.DS.degree===5&&poly.DS.topFive===1,"dominated SOURCE fifth order +1");
ok(poly.U.degree===4&&poly.U.topFive===0,"fifth order cancels in disjoint union");
ok(parity.EVEN.gS===3&&parity.ODD.gS===2,"original October five-switch P1 grade2 mass");
ok(parity.EVEN.DS===0&&parity.ODD.DS===1,"September WSL live SOURCE mass");
ok(parity.EVEN.U===3&&parity.ODD.U===3,"parity cancellation exact");
console.log(JSON.stringify({schema:"c4.original7x6_two_P1_residual_survivor_modes.v1",status:"EXACT_FIRSTWIN_P1_GRADE2_AND_WSL_DOMINANCE_FIFTH_ORDER_CANCEL",geometry:"7x6-k4 real original69",sourcePositions:32,originalRisingLine:rising.map(i=>[i%W+1,Math.floor(i/W)+1]),parity,polynomial:{gS:{degree:poly.gS.degree,topFive:poly.gS.topFive,terms:poly.gS.nonzeroTerms},DS:{degree:poly.DS.degree,topFive:poly.DS.topFive,terms:poly.DS.nonzeroTerms},U:{degree:poly.U.degree,topFive:poly.U.topFive,terms:poly.U.nonzeroTerms,monomials:poly.U.terms}},positiveStateIndices:survivorIndices,sourceOnlyDominanceAfterMove:"BLOCKED_NOT_A_POSTSTATE_D",solvedGameKnowledge:false,rootGameValueProved:false},null,2));