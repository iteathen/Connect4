const WIDTH=7,HEIGHT=6,STRIDE=7,CELLS=42;
const MIN_SCORE=-18,MAX_SCORE=18,TT_UPPER_LIMIT=MAX_SCORE-MIN_SCORE+1,
  TT_LOWER_OFFSET=MAX_SCORE-2*MIN_SCORE+2,TT_UPPER_OFFSET=-MIN_SCORE+1;
const ORDER=[3,4,2,5,1,6,0];
let bottomMask=0n;
const columnMasks=[],bottomMasks=[],topMasks=[];
for(let col=0;col<WIDTH;col++){
  const shift=BigInt(col*STRIDE);
  bottomMasks[col]=1n<<shift;
  topMasks[col]=1n<<BigInt(HEIGHT-1+col*STRIDE);
  columnMasks[col]=((1n<<BigInt(HEIGHT))-1n)<<shift;
  bottomMask|=bottomMasks[col];
}
const boardMask=bottomMask*((1n<<BigInt(HEIGHT))-1n);
function popcount(value){let count=0;while(value){value&=value-1n;count++;}return count;}
function winningPositions(position,mask){
  let result=(position<<1n)&(position<<2n)&(position<<3n),pair;
  pair=(position<<7n)&(position<<14n);result|=pair&(position<<21n);result|=pair&(position>>7n);
  pair=(position>>7n)&(position>>14n);result|=pair&(position<<7n);result|=pair&(position>>21n);
  pair=(position<<6n)&(position<<12n);result|=pair&(position<<18n);result|=pair&(position>>6n);
  pair=(position>>6n)&(position>>12n);result|=pair&(position<<6n);result|=pair&(position>>18n);
  pair=(position<<8n)&(position<<16n);result|=pair&(position<<24n);result|=pair&(position>>8n);
  pair=(position>>8n)&(position>>16n);result|=pair&(position<<8n);result|=pair&(position>>24n);
  return result&(boardMask^mask);
}
const possible=mask=>(mask+bottomMask)&boardMask;
const canPlay=(mask,col)=>(mask&topMasks[col])===0n;
const isWinningMove=(current,mask,col)=>(winningPositions(current,mask)&possible(mask)&columnMasks[col])!==0n;
const playColumnMask=(mask,col)=>(mask+bottomMasks[col])&columnMasks[col];
const truncHalf=v=>Math.trunc(v/2);
function fromSequence(sequence){
  let current=0n,mask=0n,moves=0;
  for(let i=0;i<sequence.length;i++){
    const col=sequence.charCodeAt(i)-49;
    if(col<0||col>=WIDTH||!canPlay(mask,col)||isWinningMove(current,mask,col))throw RangeError('invalid sequence');
    const move=playColumnMask(mask,col);current^=mask;mask|=move;moves++;
  }
  return {current,mask,moves};
}
class TwoWayTT{
  constructor(bits=24){
    this.bucketCount=2**bits;this.mask=this.bucketCount-1;this.slots=this.bucketCount*2;
    this.keys=new Float64Array(this.slots);this.values=new Uint8Array(this.slots);this.repl=new Uint8Array(this.bucketCount);
    this.hits=0;this.stores=0;this.collisions=0;
  }
  bucket(key){
    const lo=key>>>0,hi=Math.floor(key/4294967296)>>>0;
    let x=(lo^Math.imul(hi,0x9e3779b1))>>>0;
    x^=x>>>16;x=Math.imul(x,0x85ebca6b)>>>0;x^=x>>>13;
    return x&this.mask;
  }
  get(key){
    const b=this.bucket(key),i=b*2,v0=this.values[i];
    if(v0&&this.keys[i]===key){this.hits++;return v0;}
    const v1=this.values[i+1];
    if(v1&&this.keys[i+1]===key){this.hits++;return v1;}
    return 0;
  }
  set(key,value){
    const b=this.bucket(key),i=b*2;
    if(this.values[i]&&this.keys[i]===key){this.values[i]=value;return;}
    if(this.values[i+1]&&this.keys[i+1]===key){this.values[i+1]=value;return;}
    let slot;
    if(!this.values[i])slot=i;
    else if(!this.values[i+1])slot=i+1;
    else{this.collisions++;slot=i+(this.repl[b]&1);this.repl[b]^=1;}
    this.keys[slot]=key;this.values[slot]=value;this.stores++;
  }
}
class Solver{
  constructor(bits){
    this.table=new TwoWayTT(bits);this.nodes=0;
    this.moveBits=new Array((CELLS+1)*WIDTH).fill(0n);
    this.moveScores=new Int8Array((CELLS+1)*WIDTH);
  }
  solveSequence(sequence){const s=fromSequence(sequence);return this.solve(s.current,s.mask,s.moves);}
  solve(current,mask,moves){
    if((winningPositions(current,mask)&possible(mask))!==0n)return truncHalf(CELLS+1-moves);
    let min=-truncHalf(CELLS-moves),max=truncHalf(CELLS+1-moves);
    while(min<max){
      let med=min+truncHalf(max-min);
      if(med<=0&&truncHalf(min)<med)med=truncHalf(min);
      else if(med>=0&&truncHalf(max)>med)med=truncHalf(max);
      const score=this.negamax(current,mask,moves,med,med+1);
      if(score<=med)max=score;else min=score;
    }
    return min===0?0:min;
  }
  negamax(current,mask,moves,alpha,beta){
    this.nodes++;
    let candidates=possible(mask);
    const opponentWins=winningPositions(current^mask,mask),forced=candidates&opponentWins;
    if(forced!==0n){
      if((forced&(forced-1n))!==0n)return -truncHalf(CELLS-moves);
      candidates=forced;
    }
    candidates&=~(opponentWins>>1n);
    if(candidates===0n)return -truncHalf(CELLS-moves);
    if(moves>=CELLS-2)return 0;

    let min=-truncHalf(CELLS-2-moves);
    if(alpha<min){alpha=min;if(alpha>=beta)return alpha;}
    let max=truncHalf(CELLS-1-moves);
    if(beta>max){beta=max;if(alpha>=beta)return beta;}

    const key=Number(current+mask),cached=this.table.get(key);
    if(cached!==0){
      if(cached>TT_UPPER_LIMIT){
        min=cached-TT_LOWER_OFFSET;
        if(alpha<min){alpha=min;if(alpha>=beta)return alpha;}
      }else{
        max=cached-TT_UPPER_OFFSET;
        if(beta>max){beta=max;if(alpha>=beta)return beta;}
      }
    }

    const base=moves*WIDTH;let count=0;
    for(const col of ORDER){
      const move=candidates&columnMasks[col];if(move===0n)continue;
      const score=popcount(winningPositions(current|move,mask));
      let at=count;
      while(at>0&&this.moveScores[base+at-1]<score){
        this.moveScores[base+at]=this.moveScores[base+at-1];
        this.moveBits[base+at]=this.moveBits[base+at-1];at--;
      }
      this.moveScores[base+at]=score;this.moveBits[base+at]=move;count++;
    }
    for(let i=0;i<count;i++){
      const move=this.moveBits[base+i],
        score=-this.negamax(current^mask,mask|move,moves+1,-beta,-alpha);
      if(score>=beta){this.table.set(key,score+TT_LOWER_OFFSET);return score;}
      if(score>alpha)alpha=score;
    }
    this.table.set(key,alpha+TT_UPPER_OFFSET);
    return alpha;
  }
}

const sequence=process.env.SEQUENCE,bits=Number(process.env.TT_BITS??24);
if(!/^(441|442|443|444)$/.test(sequence??''))throw Error('SEQUENCE');
if(!Number.isInteger(bits)||bits<18||bits>25)throw Error('TT_BITS');
const solver=new Solver(bits),start=performance.now(),
  score=solver.solveSequence(sequence),elapsedMs=performance.now()-start;
console.log(JSON.stringify({
  schema:'connect4.44.bounded-bitboard-independent.v1',
  sequence,score,scoreSign:score===0?0:score>0?1:-1,
  nodes:solver.nodes,elapsedMs,
  tt:{bits,buckets:solver.table.bucketCount,slots:solver.table.slots,
    hits:solver.table.hits,stores:solver.table.stores,collisions:solver.table.collisions},
  solvedInputsUsed:false,
  proofBoundary:'all values recursively derive from legal transitions and terminal rules; TT replacement affects reuse only'
},null,2));
