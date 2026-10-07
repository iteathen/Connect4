// Qualification-only physical board reference. No IsoMax, RBA, bitboard,
// residual-support, cache-key, or producer imports.
export function physicalToAbsoluteWdl(wdl,rank){
 if(![-1,0,1].includes(wdl)||!Number.isInteger(rank)||rank<0)throw RangeError('invalid WDL or rank');
 return wdl===0?0:(rank&1)?-wdl:wdl;
}
export function inspectHistory(moves,{columns=7,rows=6}={}){
 const board=Array.from({length:columns},()=>Array(rows).fill(0)),heights=Array(columns).fill(0);
 let winner=0,turn=1;
 for(const column of moves){
  if(winner||heights.reduce((a,b)=>a+b,0)===columns*rows)throw RangeError('move after terminal position');
  if(!Number.isInteger(column)||column<0||column>=columns||heights[column]===rows)throw RangeError('illegal column');
  const row=heights[column]++;board[column][row]=turn;
  if(winsAt(board,column,row,turn,columns,rows))winner=turn;
  turn=3-turn;
 }
 return {board,heights,winner,turn,columns,rows};
}
function winsAt(board,column,row,player,columns,rows){
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  let length=1;
  for(const sign of [-1,1])for(let n=1;n<4;n++){
   const x=column+sign*n*dx,y=row+sign*n*dy;
   if(x<0||x>=columns||y<0||y>=rows||board[x][y]!==player)break;
   length++;
  }
  if(length>=4)return true;
 }
 return false;
}
export function solvePhysical(moves,dimensions={}){
 const state=inspectHistory(moves,dimensions),{board,heights,columns,rows}=state,memo=new Map();
 let nodes=0;
 function descend(turn,remaining){
  nodes++;if(!remaining)return 0;
  const key=turn+':'+board.map(column=>column.join('')).join('|');
  if(memo.has(key))return memo.get(key);
  let best=-1;
  for(let column=0;column<columns;column++){
   if(heights[column]===rows)continue;
   const row=heights[column]++;board[column][row]=turn;
   const value=winsAt(board,column,row,turn,columns,rows)?1:-descend(3-turn,remaining-1);
   board[column][row]=0;heights[column]--;
   best=Math.max(best,value);if(best===1)break;
  }
  memo.set(key,best);return best;
 }
 if(state.winner)return {wdl:-1,bestMoves:[],nodes:1};
 const remaining=columns*rows-moves.length;
 if(!remaining)return {wdl:0,bestMoves:[],nodes:1};
 if(remaining>10)throw RangeError('physical minimax is bounded to ten empty cells');
 const scores=[];
 for(let column=0;column<columns;column++){
  if(heights[column]===rows)continue;
  const row=heights[column]++;board[column][row]=state.turn;
  const value=winsAt(board,column,row,state.turn,columns,rows)?1:-descend(3-state.turn,remaining-1);
  board[column][row]=0;heights[column]--;scores.push([column,value]);
 }
 const wdl=Math.max(...scores.map(([,value])=>value));
 return {wdl:wdl||0,bestMoves:scores.filter(([,value])=>value===wdl).map(([column])=>column),nodes};
}
export function buildCorpus({count=240}={}){
 if(!Number.isInteger(count)||count<8||count>2000)throw RangeError('bounded corpus count 8..2000 required');
 let seed=0x725193ad;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 const strata=Array.from({length:8},()=>[]),seen=new Set();
 // Avoid winning moves during generation, but solve every legal child at the
 // oracle boundary. This yields nonterminal roots with dense physical boards.
 for(let trial=0;trial<20000&&strata.some(s=>s.length<Math.ceil(count/8));trial++){
  const board=Array.from({length:7},()=>Array(6).fill(0)),heights=Array(7).fill(0),moves=[];
  for(let ply=0;ply<39;ply++){
   const candidates=[],turn=1+(ply&1);
   for(let column=0;column<7;column++)if(heights[column]<6){
    const row=heights[column];board[column][row]=turn;
    if(!winsAt(board,column,row,turn,7,6))candidates.push(column);
    board[column][row]=0;
   }
   if(!candidates.length)break;
   const column=candidates[random()%candidates.length];board[column][heights[column]++]=turn;moves.push(column);
   if(moves.length>=32){
    const rank=moves.length,key=moves.join(''),bucket=strata[rank-32];
    if(bucket.length<Math.ceil(count/8)&&!seen.has(key)){
     seen.add(key);bucket.push({id:'late-'+rank+'-'+String(bucket.length+1).padStart(3,'0'),moves:moves.slice(),rank});
    }
   }
  }
 }
 const corpus=[];
 for(let row=0;corpus.length<count;row++)for(const bucket of strata){
  if(bucket[row]&&corpus.length<count)corpus.push(bucket[row]);
  if(row>count)throw Error('unable to fill deterministic late corpus');
 }
 return corpus;
}
