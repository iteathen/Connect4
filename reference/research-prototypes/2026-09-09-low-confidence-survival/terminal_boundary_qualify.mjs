import assert from 'node:assert/strict';
import fs from 'node:fs';

function popcount32(v) {
  v >>>= 0;
  let n = 0;
  while (v) { v &= v - 1; n++; }
  return n;
}

function linesNumber(W, H, K) {
  assert(W * H < 31, 'Number/bitwise line helper is for small boards only');
  const lines = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    for (const [dx, dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
      const x = c + (K - 1) * dx, y = r + (K - 1) * dy;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      let mask = 0; const cells = [];
      for (let j = 0; j < K; j++) {
        const cell = (r + j * dy) * W + c + j * dx;
        mask |= 1 << cell; cells.push(cell);
      }
      lines.push({mask,cells,c,r,dx,dy});
    }
  }
  return lines;
}

function hasLineNumber(bits, lines) {
  return lines.some(line => (bits & line.mask) === line.mask);
}

function completedLineIdsNumber(bits, landingCell, lines) {
  const landingBit = 1 << landingCell, out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if ((line.mask & landingBit) !== 0 && (bits & line.mask) === line.mask) out.push(i);
  }
  return out;
}

function directionalWinNumber(bits, W, H, K, landingCell) {
  const row = Math.trunc(landingCell / W), col = landingCell - row * W;
  const owns = (c,r) => c >= 0 && c < W && r >= 0 && r < H && (bits & (1 << (r * W + c))) !== 0;
  for (const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
    let count = 1;
    for (const sign of [-1,1]) {
      let c = col + sign * dx, r = row + sign * dy;
      while (owns(c,r)) { count++; c += sign * dx; r += sign * dy; }
    }
    if (count >= K) return true;
  }
  return false;
}

function landingRowNumber(occupied, W, H, col) {
  for (let row = 0; row < H; row++) if ((occupied & (1 << (row * W + col))) === 0) return row;
  return H;
}

function validateGravityNumber(p0, p1, W, H) {
  const occupied = p0 | p1;
  for (let col = 0; col < W; col++) {
    let empty = false;
    for (let row = 0; row < H; row++) {
      const filled = (occupied & (1 << (row * W + col))) !== 0;
      if (!filled) empty = true;
      else assert(!empty, `floating stone c${col} r${row}`);
    }
  }
}

function exhaustiveTerminalBoundary(W, H, K) {
  const CELLS = W * H, SCALE = 2 ** CELLS, lines = linesNumber(W,H,K);
  const seen = new Set(), stack = [[0,0]], hitLines = new Set();
  let states=0, legalEdges=0, winTerminalEdges=0, drawTerminalEdges=0;
  let terminalPredicateMismatches=0, terminalBoardMismatches=0, priorTerminalViolations=0;
  while (stack.length) {
    const [p0,p1] = stack.pop(), key = p0 + p1 * SCALE;
    if (seen.has(key)) continue;
    seen.add(key); states++;
    assert.equal(p0 & p1, 0); validateGravityNumber(p0,p1,W,H);
    if (hasLineNumber(p0,lines) || hasLineNumber(p1,lines)) { priorTerminalViolations++; continue; }
    const occupied=p0|p1, moves=popcount32(occupied), player=moves&1;
    assert.equal(popcount32(p0), Math.ceil(moves/2));
    assert.equal(popcount32(p1), Math.floor(moves/2));
    for (let col=0; col<W; col++) {
      const row=landingRowNumber(occupied,W,H,col); if(row===H) continue;
      legalEdges++; const cell=row*W+col, bit=1<<cell, before=player?p1:p0, after=before|bit;
      const byMask=completedLineIdsNumber(after,cell,lines), byDirection=directionalWinNumber(after,W,H,K,cell);
      if ((byMask.length>0)!==byDirection) terminalPredicateMismatches++;
      const n0=player?p0:after, n1=player?after:p1; validateGravityNumber(n0,n1,W,H);
      if (byMask.length) {
        winTerminalEdges++; byMask.forEach(id=>hitLines.add(id));
        if (!hasLineNumber(after,lines) || !byDirection || hasLineNumber(player?p0:p1,lines)) terminalBoardMismatches++;
        for (const id of byMask) assert(lines[id].cells.includes(cell));
        continue;
      }
      if (moves+1===CELLS) {
        drawTerminalEdges++;
        if (hasLineNumber(n0,lines)||hasLineNumber(n1,lines)) terminalBoardMismatches++;
        continue;
      }
      const nkey=n0+n1*SCALE; if(!seen.has(nkey)) stack.push([n0,n1]);
    }
  }
  return {profile:`${W}x${H}c${K}`,lines:lines.length,states,legalEdges,winTerminalEdges,drawTerminalEdges,terminalPredicateMismatches,terminalBoardMismatches,priorTerminalViolations,winningLineSchemasHit:hitLines.size,winningLineSchemasTotal:lines.length};
}

function linesBigInt(W,H,K) {
  const lines=[];
  for(let r=0;r<H;r++) for(let c=0;c<W;c++) for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
    const x=c+(K-1)*dx,y=r+(K-1)*dy; if(x<0||x>=W||y<0||y>=H) continue;
    let mask=0n; const cells=[];
    for(let j=0;j<K;j++){const cell=(r+j*dy)*W+c+j*dx; mask|=1n<<BigInt(cell); cells.push(cell);}
    lines.push({mask,cells,c,r,dx,dy});
  }
  return lines;
}
function hasLineBig(bits,lines){return lines.some(line=>(bits&line.mask)===line.mask);}
function completedLineIdsBig(bits,cell,lines){const b=1n<<BigInt(cell),out=[];for(let i=0;i<lines.length;i++){const l=lines[i];if((l.mask&b)!==0n&&(bits&l.mask)===l.mask)out.push(i);}return out;}
function directionalWinBig(bits,W,H,K,cell){
  const row=Math.trunc(cell/W),col=cell-row*W;
  const owns=(c,r)=>c>=0&&c<W&&r>=0&&r<H&&(bits&(1n<<BigInt(r*W+c)))!==0n;
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let count=1;for(const sign of [-1,1]){let c=col+sign*dx,r=row+sign*dy;while(owns(c,r)){count++;c+=sign*dx;r+=sign*dy;}}if(count>=K)return true;}return false;
}
function validateGravityBig(p0,p1,W,H){const occ=p0|p1;for(let c=0;c<W;c++){let empty=false;for(let r=0;r<H;r++){const filled=(occ&(1n<<BigInt(r*W+c)))!==0n;if(!filled)empty=true;else assert(!empty,`floating stone c${c} r${r}`);}}}

function parse7x6(sequence) {
  const W=7,H=6,K=4,lines=linesBigInt(W,H,K); let p0=0n,p1=0n; const heights=new Uint8Array(W);
  for(let ply=0;ply<sequence.length;ply++){
    assert(!hasLineBig(p0,lines)&&!hasLineBig(p1,lines),`known sequence continued after terminal at ply ${ply}`);
    const col=sequence.charCodeAt(ply)-49,row=heights[col]; assert(col>=0&&col<W&&row<H);
    const bit=1n<<BigInt(row*W+col); if(ply&1)p1|=bit;else p0|=bit; heights[col]++;
  }
  assert(!hasLineBig(p0,lines)&&!hasLineBig(p1,lines),`known oracle root already terminal: ${sequence}`);
  validateGravityBig(p0,p1,W,H); return {p0,p1,heights,moves:sequence.length,lines};
}

function knownSolvedActionTerminalBoundary() {
  const text=fs.readFileSync(new URL('../../oracles/solved-actions-v1.tsv',import.meta.url),'utf8').trim();
  const rows=text.split(/\r?\n/); assert.equal(rows.length,128);
  let actionSlots=0,legalActions=0,immediateTerminalActions=0,fullBoardDrawActions=0;
  let terminalPredicateMismatches=0,knownScoreMismatches=0,terminalBoardMismatches=0,maxScoreConsistencyMismatches=0;
  const hitLines=new Set(),examples=[];
  for(const line of rows){
    const [group,sourceSet,sourceLine,sequence,rootScoreText,scoresText]=line.split('\t');
    const rootScore=Number(rootScoreText),scores=scoresText.split(',').map(Number); assert.equal(scores.length,7); assert.equal(Math.max(...scores),rootScore);
    const {p0,p1,heights,moves,lines:winLines}=parse7x6(sequence),player=moves&1;
    const maximumImmediateScore=Math.trunc((43-moves)/2); let rowImmediateCount=0;
    for(let col=0;col<7;col++){
      actionSlots++; const score=scores[col],row=heights[col];
      if(row===6){assert.equal(score,-1000);continue;} legalActions++; assert.notEqual(score,-1000);
      const cell=row*7+col,bit=1n<<BigInt(cell),before=player?p1:p0,after=before|bit;
      const completed=completedLineIdsBig(after,cell,winLines),byDirection=directionalWinBig(after,7,6,4,cell);
      if((completed.length>0)!==byDirection)terminalPredicateMismatches++;
      const n0=player?p0:after,n1=player?after:p1; validateGravityBig(n0,n1,7,6);
      if(completed.length){
        rowImmediateCount++; immediateTerminalActions++; completed.forEach(id=>hitLines.add(id));
        if(score!==maximumImmediateScore)knownScoreMismatches++;
        if(!hasLineBig(after,winLines)||!byDirection||hasLineBig(player?p0:p1,winLines))terminalBoardMismatches++;
        if(examples.length<12)examples.push({group,sourceSet,sourceLine:Number(sourceLine),sequence,col:col+1,landingRow:row+1,score,expected:maximumImmediateScore,lineIds:completed});
      } else {
        if(score===maximumImmediateScore)knownScoreMismatches++;
        if(moves+1===42){fullBoardDrawActions++;if(score!==0||hasLineBig(n0,winLines)||hasLineBig(n1,winLines))terminalBoardMismatches++;}
      }
    }
    if((rootScore===maximumImmediateScore)!==(rowImmediateCount>0))maxScoreConsistencyMismatches++;
  }
  return {vectors:rows.length,actionSlots,legalActions,immediateTerminalActions,fullBoardDrawActions,terminalPredicateMismatches,knownScoreMismatches,terminalBoardMismatches,maxScoreConsistencyMismatches,winningLineSchemasHit:hitLines.size,winningLineSchemasTotal:69,examples};
}

const small=[exhaustiveTerminalBoundary(4,3,3),exhaustiveTerminalBoundary(4,4,4),exhaustiveTerminalBoundary(5,3,4),exhaustiveTerminalBoundary(4,5,4)];
const known7x6=knownSolvedActionTerminalBoundary();
for(const r of small){assert.equal(r.terminalPredicateMismatches,0);assert.equal(r.terminalBoardMismatches,0);assert.equal(r.priorTerminalViolations,0);}
assert.equal(known7x6.terminalPredicateMismatches,0);assert.equal(known7x6.knownScoreMismatches,0);assert.equal(known7x6.terminalBoardMismatches,0);assert.equal(known7x6.maxScoreConsistencyMismatches,0);
console.log(JSON.stringify({kind:'terminal-boundary-qualification',small,known7x6},null,2));
