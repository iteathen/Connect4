// Frozen SOURCE P0 policy (not WDL): one center opener, then win-now,
// else upper-mate P1 in the same column, else nearest-center legal top spill.
// Original gravity, first-win stopped, no solved WDL or lookahead.
export function originalLines(W,H,K=4){
 const L=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
  for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
   const coords=Array.from({length:K},(_,i)=>[c+dc*i,r+dr*i]);
   if(coords.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
    L.push(coords);
  }
 return L;
}
export function empty(W,H){
 return {W,H,n:0,h:Array(W).fill(0),
  b:Array.from({length:W},()=>Array(H).fill(-1))};
}
export const copy=q=>({
 W:q.W,H:q.H,n:q.n,h:q.h.slice(),b:q.b.map(row=>row.slice())
});
export const legal=q=>q.h.map((v,c)=>v<q.H?c:-1).filter(c=>c>=0);
export function physicalPlacement(q,c){
 if(c<0||c>=q.W||q.h[c]>=q.H)throw Error("illegal gravity");
 const player=q.n%2,row=q.h[c]++;
 q.b[c][row]=player;q.n++;
 const won=originalLines(q.W,q.H).some(line=>
  line.every(([x,y])=>q.b[x][y]===player));
 return {player,col:c,row,won};
}
export function originalP0Immediate(q){
 if(q.n%2!==0)throw Error("not P0 to move");
 const lineSet=originalLines(q.W,q.H);
 const out=[];
 for(const c of legal(q)){
  const cellRow=q.h[c];
  if(lineSet.some(line=>line.includes(null)))throw Error("unreachable");
  if(lineSet.some(line=>line.every(([x,y])=>
    (x===c&&y===cellRow)||q.b[x][y]===0)))
   out.push(c);
 }
 return out;
}
export function sourceP0Response(q,p1column){
 if(q.n%2!==0)throw Error("expected P0 response turn");
 const imminent=originalP0Immediate(q);
 if(imminent.length)return {column:imminent[0],cause:"immediate_original_P0_firstwin"};
 if(p1column>=0&&p1column<q.W&&q.h[p1column]<q.H)
  return {column:p1column,cause:"physical_same_column_upper_mate"};
 const center=Math.floor((q.W-1)/2);
 const options=legal(q).sort((a,b)=>Math.abs(a-center)-Math.abs(b-center)||a-b);
 if(!options.length)return {column:null,cause:"full_board_draw"};
 return {column:options[0],cause:"nearest_center_top_spill"};
}
