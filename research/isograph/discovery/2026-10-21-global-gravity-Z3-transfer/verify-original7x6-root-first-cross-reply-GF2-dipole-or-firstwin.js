/**
 * ONE fixed source-only P0 opening script from original EMPTY:
 * P0 plays c4,c3,c5,c2; every P1 either follows same column and loses
 * at ply7 (original horizontal c2-c5) or first deviates at ply2/4/6,
 * necessarily producing a GF(2) two-column height-parity dipole.
 * Proves algebraic implication; controls inspect 18 possible FIRST
 * deviations (not all 7^3 adaptive replies), and one matched trajectory.
 * No perfect-play WDL conclusion from the latter dipole.
 */
"use strict";
const ok=(b,m)=>{if(!b)throw Error("C4_ROOT_DIPOLE "+m);};
const W=7,H=6,actions=[4,3,5,2],D=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dc,dr,t]of D){
 const s=[];for(let i=0;i<4;i++){
  const x=c+i*dc,y=r+i*dr;if(x<0||x>=W||y<0||y>=H){s.length=0;break;}s.push([x,y]);
 }
 if(s.length===4)lines.push({type:t,cells:s});
}
ok(lines.length===69,"original69 K4");
const newBoard=()=>({h:Array(W).fill(0),b:Array.from({length:W},()=>Array(H).fill(-1))});
function ray(q,c,r,p){
 for(const[dc,dr]of D){let n=1;
  for(const side of [-1,1])for(let k=1;k<4;k++){
   const x=c+side*k*dc,y=r+side*k*dr;
   if(x<0||x>=W||y<0||y>=H||q.b[x][y]!==p)break;n++;
  }if(n>=4)return true;
 }
 return false;
}
function play(q,column,player){
 const c=column-1,r=q.h[c];ok(r<H,"legal target under bounded first7 plies");
 q.h[c]++;q.b[c][r]=player;
 const firstwin=lines.some(L=>L.cells.every(([x,y])=>q.b[x][y]===player));
 ok(firstwin===ray(q,c,r,player),"original69 physical K4/ray agreement");
 return {column,row:r+1,player,firstwin};
}
function oddCols(q){return q.h.flatMap((v,i)=>v%2?[i+1]:[]);}
const matched=newBoard(),matchedTrace=[];
for(let i=0;i<4;i++){
 const a=actions[i],d=play(matched,a,0);
 matchedTrace.push(d);
 ok(d.firstwin===(i===3),"P0 completes original row1 four only on move7");
 if(i<3){const r=play(matched,a,1);matchedTrace.push(r);ok(!r.firstwin,"P1 no four with <=3 stones");}
}
ok(matchedTrace.map(x=>x.column).join(",")==="4,4,3,3,5,5,2","all-follow legal policy word");
ok(matched.b[1][0]===0&&matched.b[2][0]===0&&matched.b[3][0]===0&&matched.b[4][0]===0,"original P0 c2..c5 bottom firstwin");
const controls=[],seen=new Set();
for(let firstDeviation=0;firstDeviation<3;firstDeviation++){
 const a=actions[firstDeviation];
 for(let reply=1;reply<=7;reply++){
  if(reply===a)continue;
  const q=newBoard();
  for(let j=0;j<firstDeviation;j++){
   const p0=play(q,actions[j],0),p1=play(q,actions[j],1);
   ok(!p0.firstwin&&!p1.firstwin,"matched earlier prefixes nonterminal");
   ok(oddCols(q).length===0,"previously matched column pairs reset all parity defects");
  }
  const beforeP0Odd=oddCols(q);
  ok(beforeP0Odd.length===0,"source parity exactly even before first deviation");
  const p0=play(q,a,0),p1=play(q,reply,1);
  ok(!p0.firstwin&&!p1.firstwin,"no firstwinning with <=3 owner stones");
  const odd=oddCols(q).sort((x,y)=>x-y),want=[a,reply].sort((x,y)=>x-y);
  ok(odd.length===2&&odd.every((v,i)=>v===want[i]),"forced first deviation creates precisely two odd columns");
  let seam=0;
  for(let c=0;c<6;c++)if((q.h[c]&1)!==(q.h[c+1]&1))seam|=1<<c;
  const direct=Array(7).fill(0);direct[a-1]^=1;direct[reply-1]^=1;
  const derived=direct.slice(0,6).reduce((m,z,c)=>m|((z^direct[c+1])<<c),0);
  ok(seam===derived,"GF2 two-column phase dipole coboundary exact");
  controls.push({firstDeviationP1ReplyPly:2*(firstDeviation+1),P0Column:a,P1AlternativeColumn:reply,oddColumns:odd,seamBitsGF2:seam});
  seen.add(firstDeviation+":"+reply);
 }
}
ok(controls.length===18&&seen.size===18,"three earliest stages x six alternate response labels");
const report={schema:"c4.original7x6_root_P0_fixed_script_dipole_or_firstwin.v1",
status:"EXACT_EMPTY_ROOT_BOUNDARY_WIN_OR_FIRST_GF2_DIPOLE_UNIVERSAL_PREFIX",
geometry:"original 7x6 K4",P0FixedColumns:actions,
theorem:"For any firstwinner-free P1 replies to P0 c4,c3,c5,c2, either P1 differs from the immediately preceding P0 column by ply2/4/6 (earliest such response creates a two-column odd-height GF2 dipole), or P0 completes original bottom horizontal K4 c2-c5 on ply7. All fixed P0 column moves are legal through ply7, and P1 cannot firstwin with only three placed stones.",
matchedPolicyOriginalPhysicalPath:matchedTrace,
earliestDeviationLocalControls:controls,
proofLevel:"uniform short-prefix Boolean/height parity identity, not a perfect-play winning continuation",
fullOpponentThreeReplyCombinationsEnumerated:0,wholeGamePositionsEnumerated:0,solvedGameDataUsed:false,
rootP0WDL:"NOT_PROVED",maintainedCI:"NOT_RUN"};
console.log(JSON.stringify(report,null,2));