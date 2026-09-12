import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN, TACTICAL_NONE, TACTICAL_DRAW, TACTICAL_LOSS, TACTICAL_IMMEDIATE_BASE,
  FRONTIER_BOUND_NONE, FRONTIER_BOUND_DRAW, FRONTIER_BOUND_MOVER_NO_WIN, FRONTIER_BOUND_OPPONENT_NO_WIN } from './quotient-negamax-domain-contract.mjs';

// Qualification-only physical oracle: direct directional scans, no residual,
// production geometry, tactical helper, TT or search-policy result as authority.
function fixture(spec) {
  const {columns:W,rows:H,connect:K}=spec;
  // This lane compares physical exhaustion exactly. Strategic response bounds
  // receive an independent full-WDL check in quotient-pruning-campaign.mjs.
  const {kernel}=createSlot64ResidualQuotientKernel(spec,{cacheEdges:false,prefixClasses:4096,responseClosure:false});
  const board=new Int8Array(W*H);board.fill(-1);
  const heights=new Uint8Array(W);
  const directions=[[1,0],[0,1],[1,1],[1,-1]];
  const lines=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of directions){
    if(c+(K-1)*dc<0||c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
    const line=[];for(let k=0;k<K;k++)line.push((r+k*dr)*W+c+k*dc);lines.push(line);
  }
  const seedStack=[kernel.frontierOrder.createRootSeed()];
  const counts={states:0,legalEdges:0,illegalEdges:0,winningEdges:0,fullDrawEdges:0,immediateStates:0,forcedStates:0,doubleThreatStates:0,exhaustedDrawStates:0,fullDrawStates:0,ownWinOverridesThreat:0,winsAboveCell31:0,winDirections:[0,0,0,0],winsByPlayer:[0,0],standardEvalChecks:0};
  function winDirections(cell,player) {
    const c=cell%W,r=Math.floor(cell/W);let mask=0;
    for(let d=0;d<directions.length;d++){
      const [dc,dr]=directions[d];let n=1;
      for(const sign of [-1,1])for(let k=1;;k++){
        const cc=c+sign*k*dc,rr=r+sign*k*dr;
        if(cc<0||cc>=W||rr<0||rr>=H||board[rr*W+cc]!==player)break;n++;
      }
      if(n>=K)mask|=1<<d;
    }
    return mask;
  }
  function live(player) {return lines.some(line=>line.every(cell=>board[cell]!==1-player));}
  function inspect(stateId,rank) {
    counts.states++;const player=rank&1;const own=[],opponent=[],children=new Int32Array(W);children.fill(QN_ILLEGAL);
    if(rank===W*H)counts.fullDrawStates++;
    if(W===7&&H===6){
      const expected=[];
      for(let c=0;c<W;c++)if(heights[c]<H){const cell=heights[c]*W+c;
        for(let p=0;p<2;p++){const score=lines.filter(line=>line.includes(cell)&&line.every(x=>board[x]!==1-p)).length;
          assert.equal(kernel.frontierOrder.valueAtSeed(seedStack[rank],p,cell),score);counts.standardEvalChecks++;
          if(p===player)expected.push({column:c,value:score});
        }
      }
      expected.sort((a,b)=>b.value-a.value||a.column-b.column);
      assert.deepEqual(kernel.frontierOrder.orderLegal(kernel,stateId,seedStack[rank]).map(({column,value})=>({column,value})),expected);
    }
    for(let c=0;c<W;c++) {
      if(heights[c]===H){assert.equal(kernel.advance(stateId,c),QN_ILLEGAL);counts.illegalEdges++;continue;}
      counts.legalEdges++;const cell=heights[c]*W+c;
      board[cell]=player;const mask=winDirections(cell,player);board[cell]=1-player;const opponentWin=winDirections(cell,1-player);board[cell]=-1;
      if(mask){own.push(c);counts.winningEdges++;counts.winsByPlayer[player]++;if(cell>=32)counts.winsAboveCell31++;for(let d=0;d<4;d++)if(mask&(1<<d))counts.winDirections[d]++;}
      if(opponentWin)opponent.push(c);
      const child=kernel.advance(stateId,c);children[c]=child;
      if(mask)assert.equal(child,QN_TERMINAL_WIN,'geometric winning move did not terminate');
      else {assert.ok(child>=0,'nonwinning legal move was classified terminal/illegal');if(rank+1===W*H){counts.fullDrawEdges++;assert.equal(kernel.tacticalCode(child),TACTICAL_DRAW);}}
    }
    const p0Live=live(0),p1Live=live(1);const ownLive=player===0?p0Live:p1Live,otherLive=player===0?p1Live:p0Live;
    const expectedBound=!ownLive&&!otherLive?FRONTIER_BOUND_DRAW:!ownLive?FRONTIER_BOUND_MOVER_NO_WIN:!otherLive?FRONTIER_BOUND_OPPONENT_NO_WIN:FRONTIER_BOUND_NONE;
    assert.equal(kernel.frontierBoundCode(stateId),expectedBound,'residual exhaustion differs from geometric live lines');
    const tactical=kernel.tacticalCode(stateId);
    if(!p0Live&&!p1Live){counts.exhaustedDrawStates++;assert.equal(tactical,TACTICAL_DRAW);}
    else if(own.length){counts.immediateStates++;if(opponent.length>1)counts.ownWinOverridesThreat++;assert.ok(tactical>=TACTICAL_IMMEDIATE_BASE&&own.includes(tactical-TACTICAL_IMMEDIATE_BASE),'immediate win missing or points to a nonwinning move');}
    else if(opponent.length>1){counts.doubleThreatStates++;assert.equal(tactical,TACTICAL_LOSS);}
    else if(rank===W*H){assert.equal(tactical,TACTICAL_DRAW);}
    else if(opponent.length===1){counts.forcedStates++;assert.equal(tactical,opponent[0]);}
    else assert.equal(tactical,TACTICAL_NONE,'unresolved position was spuriously terminal/forced');
    return children;
  }
  function place(c,rank){const cell=heights[c]*W+c;board[cell]=rank&1;heights[c]++;seedStack[rank+1]=kernel.frontierOrder.advanceSeed(seedStack[rank],rank&1,cell);return cell;}
  function unplace(c,cell){heights[c]--;board[cell]=-1;}
  return {kernel,board,heights,counts,inspect,place,unplace};
}

function exhaustive(spec){
  const f=fixture(spec),seen=new Set();const W=spec.columns,radix=spec.rows+1,keyScale=2**(W*spec.rows);const weights=Array.from({length:W},(_,c)=>radix**c);
  function visit(id,rank,support,p0){
    const key=support*keyScale+p0;if(seen.has(key))return;seen.add(key);
    const children=f.inspect(id,rank);
    for(let c=0;c<W;c++)if(children[c]>=0){const cell=f.place(c,rank);visit(children[c],rank+1,support+weights[c],(rank&1)===0?p0+2**cell:p0);f.unplace(c,cell);}
  }
  const start=performance.now();visit(f.kernel.rootId,0,0,0);
  return {spec,mode:'complete reachable physical states, excluding post-win continuation',elapsedMs:performance.now()-start,...f.counts,quotientStates:f.kernel.states.count,mismatches:0};
}

function standard(){
  const spec={columns:7,rows:6,connect:4},f=fixture(spec);let random=0x9e3779b9;
  const next=()=>{random^=random<<13;random^=random>>>17;random^=random<<5;return random>>>0;};
  const known=['4455673','1212121','1525364'];
  for(const path of known){f.board.fill(-1);f.heights.fill(0);let id=f.kernel.rootId;
    for(let ply=0;ply<path.length;ply++){const children=f.inspect(id,ply),c=Number(path[ply])-1;assert.equal(children[c]===QN_TERMINAL_WIN,ply===path.length-1);f.place(c,ply);id=children[c];}
  }
  const start=performance.now();let completeDraws=0;
  for(let game=0;game<1000;game++){
    f.board.fill(-1);f.heights.fill(0);let id=f.kernel.rootId;
    for(let rank=0;rank<=42;rank++){
      const children=f.inspect(id,rank);if(rank===42){completeDraws++;break;}
      const legal=[],nonwinning=[];for(let c=0;c<7;c++){if(children[c]!==QN_ILLEGAL)legal.push(c);if(children[c]>=0)nonwinning.push(c);}
      const candidates=nonwinning.length&&game%4!==0?nonwinning:legal;
      const c=candidates[next()%candidates.length];if(children[c]===QN_TERMINAL_WIN)break;
      f.place(c,rank);id=children[c];
    }
  }
  assert.ok(completeDraws>0,'standard draws were not exercised');assert.ok(f.counts.winsAboveCell31>0,'high cells not exercised');assert.ok(f.counts.ownWinOverridesThreat>0,'own win precedence not exercised');assert.ok(f.counts.winDirections.every(n=>n>0),'a winning direction was not exercised');assert.ok(f.counts.winsByPlayer.every(n=>n>0),'a player win was not exercised');
  return {spec,mode:'three documented win fixtures plus 1000 deterministic legal games; every action at every sampled prefix',elapsedMs:performance.now()-start,completeDraws,...f.counts,quotientStates:f.kernel.states.count,mismatches:0};
}
const results=[];
for(const spec of [{columns:4,rows:3,connect:3},{columns:4,rows:4,connect:4},{columns:5,rows:3,connect:4},{columns:4,rows:5,connect:4}]){results.push(exhaustive(spec));global.gc?.();}
results.push(standard());
console.log(JSON.stringify({kind:'frontier-independent-terminal-boundary-qualification',status:'complete',runtime:process.version,oracle:'qualification-only physical board directional scans and independent geometric live-line enumeration',results},null,2));
