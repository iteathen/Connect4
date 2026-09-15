import assert from 'node:assert/strict';
import { geometry } from '../../../reference/research-prototypes/2026-09-09-winspace-native/support.mjs';
import { TypedWsl625ResidualSolver } from './residual_solver_wsl625_typed.mjs';

const WIDTH=7,CELLS=42,BIT_SLOTS=49,TT_LOWER_OFFSET=56,TT_UPPER_OFFSET=19;
const G=geometry();
function popBig(v){let n=0;while(v){v&=v-1n;n++;}return n;}
function pairToBig(lo,hi){return BigInt(lo>>>0)|(BigInt(hi>>>0)<<32n);}
export function heightAt(packed,column){return(packed>>>(3*column))&7;}
function lowBitIndex(z){const lo=Number(z&0xffffffffn);if(lo)return 31-Math.clz32(lo&-lo);let shift=32;z>>=32n;while(z){const w=Number(z&0xffffffffn);if(w)return shift+31-Math.clz32(w&-w);z>>=32n;shift+=32;}return-1;}

const unique=new Set();
for(const[lo,hi]of G.lines){const line=pairToBig(lo,hi);for(let subset=line;subset!==0n;subset=(subset-1n)&line)unique.add(subset);}
const masks=[...unique].sort((a,b)=>popBig(a)-popBig(b)||(a<b?-1:a>b?1:0));
assert.equal(masks.length,625);
const idByMask=new Map(masks.map((m,i)=>[m,i]));
const card=Uint8Array.from(masks,popBig);
const upBits=new Array(625);
for(let b=0;b<625;b++){let z=0n;for(let r=0;r<625;r++)if((masks[b]&~masks[r])===0n)z|=1n<<BigInt(r);upBits[b]=z;}
const cellBit=Array.from({length:BIT_SLOTS},(_,i)=>1n<<BigInt(i));
const singletonId=new Int16Array(BIT_SLOTS);singletonId.fill(-1);
const pairId=new Int16Array(BIT_SLOTS*BIT_SLOTS);pairId.fill(-1);
for(let a=0;a<BIT_SLOTS;a++){
  const s=idByMask.get(cellBit[a]);if(s!==undefined)singletonId[a]=s;
  for(let b=0;b<BIT_SLOTS;b++){const q=idByMask.get(cellBit[a]|cellBit[b]);if(q!==undefined)pairId[a*BIT_SLOTS+b]=q;}
}

export const A123_GEOMETRY=Object.freeze({WIDTH,CELLS,BIT_SLOTS,TT_LOWER_OFFSET,TT_UPPER_OFFSET,G,masks,card,upBits});

export class TypedA123Solver extends TypedWsl625ResidualSolver{
  constructor(pow=19){super(pow);this.a123Resources=new Array(64);this.a123Blockers=new Int16Array(64);this.a123Playable=new Int16Array(WIDTH);this.a123Checks=0;this.a123Hits=0;this.a123Cuts=0;this.a123Candidates=0;this.a123DfsSteps=0;}
  resetMetrics(){super.resetMetrics();this.a123Checks=0;this.a123Hits=0;this.a123Cuts=0;this.a123Candidates=0;this.a123DfsSteps=0;}
  noWinA123(currentRef,height,moves){
    this.a123Checks++;
    const len=this.side.length[currentRef];if(len===0)return false;
    let active=0n;const at=this.side.offset[currentRef];for(let i=0;i<len;i++)active|=1n<<BigInt(this.side.flat[at+i]);
    const controller=1-(moves&1);let n=0;
    for(let c=0;c<WIDTH;c++)for(let lo=heightAt(height,c);lo<5;lo++){
      const up=lo+1,a=c*7+lo,b=c*7+up,pid=pairId[a*BIT_SLOTS+b];assert(pid>=0);
      this.a123Resources[n]=cellBit[a]|cellBit[b];const bid=(up&1)===controller?singletonId[b]:pid;assert(bid>=0);this.a123Blockers[n++]=bid;
    }
    let pn=0;for(let c=0;c<WIDTH;c++){const r=heightAt(height,c);if(r<6)this.a123Playable[pn++]=c*7+r;}
    for(let i=0;i<pn;i++)for(let j=i+1;j<pn;j++){
      const a=this.a123Playable[i],b=this.a123Playable[j],bid=pairId[a*BIT_SLOTS+b];if(bid<0)continue;
      this.a123Resources[n]=cellBit[a]|cellBit[b];this.a123Blockers[n++]=bid;
    }
    this.a123Candidates+=n;
    let union=0n;for(let i=0;i<n;i++)union|=upBits[this.a123Blockers[i]]&active;if(union!==active)return false;
    let steps=0;
    const dfs=(covered,used)=>{
      if(++steps>10000)return false;if(covered===active)return true;
      const rid=lowBitIndex(active&~covered),bit=1n<<BigInt(rid);
      for(let i=0;i<n;i++){
        const closure=upBits[this.a123Blockers[i]];if((closure&bit)===0n)continue;
        const resource=this.a123Resources[i];if(resource&used)continue;
        const solved=closure&active;if((solved&~covered)===0n)continue;
        if(dfs(covered|solved,used|resource))return true;
      }
      return false;
    };
    const hit=dfs(0n,0n);this.a123DfsSteps+=steps;if(hit)this.a123Hits++;return hit;
  }
  negamax(id,alpha,beta){
    this.nodes++;
    const moves=this.arena.moves[id],height=this.arena.height[id],currentRef=this.arena.currentRef[id],opponentRef=this.arena.opponentRef[id];
    if(this.side.length[currentRef]===0&&this.side.length[opponentRef]===0){this.drawStops++;return 0;}
    const opponentWins=this.side.immediateWinningColumns(opponentRef,height);if((opponentWins&(opponentWins-1))!==0)return-Math.trunc((CELLS-moves)/2);
    const candidateColumns=[];if(opponentWins!==0)candidateColumns.push(31-Math.clz32(opponentWins));else for(const column of G.order)if(heightAt(height,column)<6)candidateColumns.push(column);
    const survivors=[];
    for(const column of candidateColumns){const prepared=this.arena.prepare(id,column);if(prepared===null)continue;if(prepared.terminal)return Math.trunc((CELLS+1-moves)/2);if(this.side.immediateWinningColumns(prepared.currentRef,prepared.height)!==0)continue;survivors.push(prepared);}
    if(survivors.length===0)return-Math.trunc((CELLS-moves)/2);if(moves>=CELLS-2)return 0;
    let min=-Math.trunc((CELLS-2-moves)/2);if(alpha<min){alpha=min;if(alpha>=beta)return alpha;}
    let max=Math.trunc((CELLS-1-moves)/2);if(beta>max){beta=max;if(alpha>=beta)return beta;}
    if(survivors.length===1){this.forcedTransitions++;return-this.negamax(this.arena.internPrepared(survivors[0]),-beta,-alpha);}
    const probe=this.probe(id,moves,alpha,beta);alpha=probe.alpha;beta=probe.beta;if(probe.cutoff)return alpha;
    if(this.side.length[currentRef]!==0&&this.noWinA123(currentRef,height,moves)&&beta>0){beta=0;if(alpha>=beta){this.a123Cuts++;this.publish(probe.slot,id,TT_UPPER_OFFSET);return beta;}}
    survivors.sort((a,b)=>b.orderScore-a.orderScore||G.order.indexOf(a.column)-G.order.indexOf(b.column));
    for(const p of survivors){const score=-this.negamax(this.arena.internPrepared(p),-beta,-alpha);if(score>=beta){this.publish(probe.slot,id,score+TT_LOWER_OFFSET);return score;}if(score>alpha)alpha=score;}
    this.publish(probe.slot,id,alpha+TT_UPPER_OFFSET);return alpha;
  }
  metrics(){return{...super.metrics(),a123Checks:this.a123Checks,a123Hits:this.a123Hits,a123Cuts:this.a123Cuts,a123Candidates:this.a123Candidates,a123DfsSteps:this.a123DfsSteps};}
}
