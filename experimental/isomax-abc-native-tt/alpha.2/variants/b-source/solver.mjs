import {prepareGeometry} from '../../shared/geometry.mjs';
import {SourceState} from '../../shared/source-state.mjs';
import {ExactTT} from './tt.mjs';

export class NodeLimitError extends Error{constructor(n){super(`node limit exceeded: ${n}`);this.name='NodeLimitError';}}
export class DeadlineError extends Error{constructor(n){super(`deadline exceeded after ${n} nodes`);this.name='DeadlineError';}}

// B: 2 fixed original-K4 viability bitplanes, bit-sliced missing-cell counts,
// and an exact source-value TT. Ordinary WDL alpha-beta, no research oracle.
export class IsoMaxB {
  constructor({columns=7,rows=6,ttMiB=32,nodeLimit=50000000,deadlineMs=0}={}){
    this.geometry=prepareGeometry({columns,rows});
    this.state=new SourceState(this.geometry);this.tt=new ExactTT(this.geometry,ttMiB);
    if(!Number.isSafeInteger(nodeLimit)||nodeLimit<1)throw RangeError('invalid nodeLimit');
    if(!Number.isSafeInteger(deadlineMs)||deadlineMs<0)throw RangeError('invalid deadlineMs');
    this.nodeLimit=nodeLimit;this.deadlineMs=deadlineMs;this.nodes=0;this.startedAt=0;
    this.immediate=0;this.dualLoss=0;this.forced=0;this.deadFields=0;this.cutoffs=0;
    this.poisonSkipped=0;this.rootMove=-1;this.used=false;
  }
  selectMove(legal){for(const c of this.geometry.order)if(legal&(1<<c))return c;return -1;}
  node(alpha,beta,isRoot=false){
    const s=this.state,g=this.geometry;
    if(++this.nodes>this.nodeLimit)throw new NodeLimitError(this.nodes);
    if((this.nodes&0x3fff)===0&&this.deadlineMs&&performance.now()-this.startedAt>this.deadlineMs)
      throw new DeadlineError(this.nodes);
    const alphaOrig=alpha,betaOrig=beta,slot=this.tt.slot(this.tt.hash(s));
    let cachedMove=-1;
    if(!isRoot){
      const encoded=this.tt.probe(s,slot),tag=encoded&7;
      if(tag)cachedMove=((encoded>>>3)&31)-1;
      if(tag){
        if(tag<=3)return tag-2;
        if(tag===4&&alpha<0)alpha=0;
        if(tag===5&&beta>0)beta=0;
        if(alpha>=beta)return 0;
      }
    }
    const mover=s.rank&1;
    const {p0,p1,legal}=s.immediateColumns();
    const live=s.liveOwnerMask();
    let value,tag=0,move=-1;
    const own=mover?p1:p0,opp=mover?p0:p1;
    if(!legal||!live){
      this.deadFields++;value=0;tag=2;move=this.selectMove(legal);
    }else if(own){
      this.immediate++;value=1;tag=3;move=this.selectMove(own);
    }else if((opp&(opp-1))!==0){
      this.dualLoss++;value=-1;tag=1;move=this.selectMove(legal);
    }else{
      // Safe one-sided source exhaustion: no winning source for P => P cannot win.
      // Return only the proven zero bound when the window already admits it.
      if(!isRoot&&!(live&(1<<mover))&&alpha>=0){if(!isRoot)this.tt.put(s,slot,5,-1);return 0;}
      if(!isRoot&&!(live&(1<<(mover^1)))&&beta<=0){if(!isRoot)this.tt.put(s,slot,4,-1);return 0;}
      const forced=opp?this.selectMove(opp):-1;
      if(forced>=0)this.forced++;
      let best=-2,cutoff=false;
      const priority=forced>=0?forced:cachedMove;
      for(let j=priority>=0?-1:0;j<g.order.length;j++){
        const col=j<0?priority:g.order[j];
        if(j>=0&&col===priority)continue;
        if(forced>=0&&col!==forced)continue;
        if(s.heights[col]>=g.rows)continue;
        // A source-ready opponent win at the site newly exposed above this
        // move proves this child LOSS without building or caching that child.
        let child;
        if(s.exposesOpponentWin(col,mover)){this.poisonSkipped++;child=-1;}
        else{
          s.apply(col,true);
          child=-this.node(-beta,-alpha);
          s.undo(col);
        }
        if(child>best){best=child;move=col;}
        if(best>alpha)alpha=best;
        if(best===1||best>=beta){cutoff=true;this.cutoffs++;break;}
      }
      value=best===-2?0:best;
      if(value===1)tag=3;
      else if(value===-1&&!cutoff)tag=1;
      else if(value<=alphaOrig)tag=value===0?5:0;
      else if(value>=betaOrig)tag=value===0?4:0;
      else tag=value+2;
    }
    if(isRoot)this.rootMove=move;
    if(tag)this.tt.put(s,slot,tag,move);
    return value;
  }
  solve(history=[]){
    if(this.used)throw Error('one-shot solver: create new session');this.used=true;
    if(!Array.isArray(history)&&!(history instanceof Uint8Array))throw TypeError('history must be zero-based column array');
    for(let i=0;i<history.length;i++){
      const win=this.state.apply(history[i]);
      if(win&&i!==history.length-1)throw RangeError(`post-terminal history at step ${i+1}`);
    }
    this.startedAt=performance.now();const cpuStart=process.cpuUsage();
    // Tri-valued exact WDL is more economical as two null-window questions.
    // First search: does the mover have a WIN? If not, second: at least DRAW?
    // Both tests are oracle-blind and share ONLY same-run exact TT results.
    // A returned +1/-1 is globally exact; a 0 from a null-window search may
    // be a bound until the second test establishes the opposite bound.
    let value;
    if(this.state.terminalWinner>=0)value=-1;
    else{
      const winTest=this.node(0,1,true);
      if(winTest===1)value=1;
      else{
        const nonlossTest=this.node(-1,0,true);
        if(nonlossTest===1)throw Error('inconsistent disjoint WDL windows');
        value=nonlossTest===-1?-1:0;
      }
    }
    const elapsedMs=performance.now()-this.startedAt,cpu=process.cpuUsage(cpuStart);
    const mover=this.state.rank&1;
    return Object.freeze({version:'0.3.0-alpha.2',variant:'B',status:'EXACT',
      rootWdl:value===0?0:(mover?-value:value),currentPlayerWdl:value===0?0:value,
      move:this.state.terminalWinner>=0?-1:this.rootMove,
      width:this.geometry.columns,height:this.geometry.rows,rank:this.state.rank,
      elapsedMs,cpuMs:(cpu.user+cpu.system)/1000,nodes:this.nodes,
      ttKind:'source-exact-blocked-line',ttEntries:this.tt.capacity,ttBytes:this.tt.bytes,ttRecordBytes:this.tt.wordsPerEntry*4,
      ttProbes:this.tt.probes,ttHits:this.tt.hits,ttStores:this.tt.stores,
      forced:this.forced,immediate:this.immediate,dualLoss:this.dualLoss,deadFields:this.deadFields,cutoffs:this.cutoffs,poisonSkipped:this.poisonSkipped});
  }
}
