// An INDEPENDENT physical-board oracle: no source bitplanes or incidence tables.
// Used for correctness testing only; never imported by the solver.
export function createPhysical(width, height) {
  const lines=[];
  for(let x=0;x<width;x++)for(let y=0;y<height;y++) {
    for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
      if(x+3*dx<0||x+3*dx>=width||y+3*dy<0||y+3*dy>=height)continue;
      const line=[];
      for(let j=0;j<4;j++)line.push([(x+j*dx),(y+j*dy)]);
      lines.push(line);
    }
  }
  const heights=new Uint8Array(width),owners=new Int8Array(width*height).fill(-1);
  let turn=0, winner=-1;
  function hasWin(player){return lines.some(line=>line.every(([c,r])=>owners[c*height+r]===player));}
  function immediateMask(player){
    let mask=0;
    for(let col=0;col<width;col++)if(heights[col]<height){
      owners[col*height+heights[col]]=player;
      if(hasWin(player))mask|=1<<col;
      owners[col*height+heights[col]]=-1;
    }
    return mask;
  }
  function push(col){
    if(winner>=0||col<0||col>=width||heights[col]>=height)throw new Error('illegal or post-terminal oracle move');
    const mover=turn&1;
    owners[col*height+heights[col]]=mover;heights[col]++;turn++;
    const win=hasWin(mover);if(win)winner=mover;
    return win;
  }
  function pop(col){
    turn--;heights[col]--;owners[col*height+heights[col]]=-1;winner=-1;
  }
  // Key is physical owner assignment (including column boundaries). Compact enough for tests.
  function key(){let s='';for(let c=0;c<width;c++){s+=':';for(let r=0;r<heights[c];r++)s+=owners[c*height+r];}return s;}
  function referenceWdl(memo=new Map()){
    if(winner>=0)return -1;
    if(turn===width*height)return 0;
    const k=key(),prev=memo.get(k);if(prev!==undefined)return prev;
    let best=-1;
    for(let c=0;c<width;c++)if(heights[c]<height){
      push(c);const v=-referenceWdl(memo);pop(c);
      if(v>best)best=(v===0?0:v);
      if(best===1)break;
    }
    memo.set(k,best);
    return best;
  }
  return {width,height,lines,heights,owners,get turn(){return turn;},get winner(){return winner;},
    hasWin,immediateMask,push,pop,key,referenceWdl};
}
