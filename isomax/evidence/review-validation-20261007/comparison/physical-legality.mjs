// Rule-only history inspection. No solver, oracle, residual or bitboard imports.
export function inspect(moves){
 const board=Array.from({length:7},()=>Array(6).fill(0)),heights=Array(7).fill(0);
 let winner=0,turn=1;
 for(const column of moves){
  if(winner||heights.reduce((a,b)=>a+b,0)===42)throw Error('Move after terminal position');
  if(!Number.isInteger(column)||column<0||column>6||heights[column]===6)throw Error('Illegal column');
  const row=heights[column]++;board[column][row]=turn;
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
   let length=1;
   for(const sign of [-1,1])for(let k=1;k<4;k++){
    const x=column+sign*k*dx,y=row+sign*k*dy;
    if(x<0||x>6||y<0||y>5||board[x][y]!==turn)break;
    length++;
   }
   if(length>=4)winner=turn;
  }
  turn=3-turn;
 }
 return {board,heights,winner,full:moves.length===42,turn};
}
export function toDigits(moves){return moves.map(c=>String(c+1)).join('');}
