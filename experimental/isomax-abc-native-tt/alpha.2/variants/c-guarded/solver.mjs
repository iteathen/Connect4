import {prepareGeometry} from '../../shared/geometry.mjs';
import {SourceState} from '../../shared/source-state.mjs';
import {GuardedTT,FORK_ATTEMPTED_NO_CERTIFICATE} from './tt.mjs';
export class NodeLimitError extends Error{constructor(n){super(`node limit exceeded: ${n}`);this.name='NodeLimitError';}}
export class DeadlineError extends Error{constructor(n){super(`deadline exceeded after ${n} nodes`);this.name='DeadlineError';}}

// C: source-native cofactor + a guarded 2-threat tactical FIRSTWIN certificate.
// Same full-horizon alpha-beta/center order as A/B; proof is optional and sound.
// Per-source TT stores exact WDL/bounds and one proof-failure hint bit.
export class IsoMaxC {
  constructor({columns=7,rows=6,ttMiB=32,nodeLimit=50000000,deadlineMs=0}={}){
    this.geometry=prepareGeometry({columns,rows});this.state=new SourceState(this.geometry);
    this.tt=new GuardedTT(this.geometry,ttMiB);
    if(!Number.isSafeInteger(nodeLimit)||nodeLimit<1)throw RangeError('invalid nodeLimit');
    if(!Number.isSafeInteger(deadlineMs)||deadlineMs<0)throw RangeError('invalid deadlineMs');
    this.nodeLimit=nodeLimit;this.deadlineMs=deadlineMs;this.nodes=0;this.startedAt=0;
    this.immediate=0;this.dualLoss=0;this.forced=0;this.deadFields=0;this.cutoffs=0;
    this.forkEligible=0;this.forkTests=0;this.forkProofs=0;this.cachedProofSkips=0;
    this.poisonSkipped=0;this.rootMove=-1;this.used=false;
  }
  selectMove(legal){for(const c of this.geometry.order)if(legal&(1<<c))return c;return -1;}
  // Necessary (not sufficient) source grade admission for a *two-column*
  // fork following this landing. Without a preexisting playable own win, both
  // next-turn winners must be either two distinct grade-2 lines contracted by
  // this move, or one grade-2 line plus a hidden grade-1 line in the cell above.
  // Missing this gate skips only an OPTIONAL proof, never a legal search move.
  mayCreateFork(site,mover){
    const s=this.state,k=s.k,f=s.fields,inc=s.g.incidence,off=site*k,base=mover*k;
    let count=0;
    for(let j=0;j<k;j++){
      let bits=(~f[2*k+j])&f[3*k+j]&(~f[4*k+j])&f[base+j]&inc[off+j];
      if(bits){
        bits&=bits-1;
        if(bits||count)return true;
        count=1;
      }
    }
    if(!count||site%s.g.rows+1>=s.g.rows)return false;
    const above=(site+1)*k;
    for(let j=0;j<k;j++){
      const grade1=f[2*k+j]&~f[3*k+j]&~f[4*k+j];
      if(grade1&f[base+j]&inc[above+j])return true;
    }
    return false;
  }
  // After the hypothetical candidate move: 2+ distinct playable wins for A,
  // zero immediate playable wins for D. The opponent cannot block two distinct
  // columns in one move, nor FIRSTWIN before the controller's following move.
  forkEstablished(mover){
    const s=this.state,g=s.g,k=s.k,f=s.fields,inc=g.incidence;
    let wins=0;
    for(let col=0;col<g.columns;col++){
      if(s.heights[col]>=g.rows)continue;
      const off=(col*g.rows+s.heights[col])*k;
      for(let j=0;j<k;j++){
        const grade1=f[2*k+j]&~f[3*k+j]&~f[4*k+j]&inc[off+j];
        if(grade1&f[(mover^1)*k+j])return false;
        if(grade1&f[mover*k+j]){wins++;break;}
      }
    }
    return wins>=2;
  }
  node(alpha,beta,isRoot=false){
    const s=this.state,g=this.geometry;
    if(++this.nodes>this.nodeLimit)throw new NodeLimitError(this.nodes);
    if((this.nodes&0x3fff)===0&&this.deadlineMs&&performance.now()-this.startedAt>this.deadlineMs)
      throw new DeadlineError(this.nodes);
    const alphaOrig=alpha,betaOrig=beta,slot=this.tt.slot(this.tt.hash(s));
    let cachedMove=-1;
    let alreadyFailedFork=false;
    if(!isRoot){
      const encoded=this.tt.probe(s,slot),tag=encoded&7;
      if(tag)cachedMove=((encoded>>>3)&31)-1;
      alreadyFailedFork=!!(encoded&FORK_ATTEMPTED_NO_CERTIFICATE);
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
    let value,tag=0,move=-1,proofMiss=false;
    const own=mover?p1:p0,opp=mover?p0:p1;
    if(!legal||!live){
      this.deadFields++;value=0;tag=2;move=this.selectMove(legal);
    }else if(own){
      this.immediate++;value=1;tag=3;move=this.selectMove(own);
    }else if((opp&(opp-1))!==0){
      this.dualLoss++;value=-1;tag=1;move=this.selectMove(legal);
    }else{
      if(!isRoot&&!(live&(1<<mover))&&alpha>=0){if(!isRoot)this.tt.put(s,slot,5,-1,alreadyFailedFork);return 0;}
      if(!isRoot&&!(live&(1<<(mover^1)))&&beta<=0){if(!isRoot)this.tt.put(s,slot,4,-1,alreadyFailedFork);return 0;}
      const forced=opp?this.selectMove(opp):-1;
      if(forced>=0)this.forced++;
      // The mover needs enough prior stones to create two K4-ready lines,
      // and at least three plies remain for the forced follow-up FIRSTWIN.
      let forkMove=-1;
      if(forced<0&&s.rank>=2*(g.connectLength-2)&&s.rank+3<=g.cells){
        if(alreadyFailedFork){this.cachedProofSkips++;}
        else{
          this.forkEligible++;
          for(let j=0;j<g.order.length;j++){
            const c=g.order[j],h=s.heights[c];
            if(h>=g.rows)continue;
            if(!this.mayCreateFork(c*g.rows+h,mover))continue;
            this.forkTests++;
            s.apply(c,true);
            const proved=this.forkEstablished(mover);
            s.undo(c);
            if(proved){forkMove=c;this.forkProofs++;break;}
          }
          if(forkMove<0)proofMiss=true;
        }
      }
      if(forkMove>=0){
        value=1;tag=3;move=forkMove;
      }else{
        let best=-2,cutoff=false;
        const priority=forced>=0?forced:cachedMove;
        for(let j=priority>=0?-1:0;j<g.order.length;j++){
          const col=j<0?priority:g.order[j];
          if(j>=0&&col===priority)continue;
          if(forced>=0&&col!==forced)continue;
          if(s.heights[col]>=g.rows)continue;
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
    }
    if(isRoot)this.rootMove=move;
    if(tag)this.tt.put(s,slot,tag,move,proofMiss||alreadyFailedFork);
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
    return Object.freeze({version:'0.3.0-alpha.2',variant:'C',status:'EXACT',
      rootWdl:value===0?0:(mover?-value:value),currentPlayerWdl:value===0?0:value,
      move:this.state.terminalWinner>=0?-1:this.rootMove,
      width:this.geometry.columns,height:this.geometry.rows,rank:this.state.rank,
      elapsedMs,cpuMs:(cpu.user+cpu.system)/1000,nodes:this.nodes,
      ttKind:'source-interleaved-with-proof-miss',ttEntries:this.tt.capacity,ttBytes:this.tt.bytes,ttRecordBytes:this.tt.wordsPerEntry*4,
      ttProbes:this.tt.probes,ttHits:this.tt.hits,ttStores:this.tt.stores,
      forced:this.forced,immediate:this.immediate,dualLoss:this.dualLoss,deadFields:this.deadFields,cutoffs:this.cutoffs,poisonSkipped:this.poisonSkipped,
      forkEligible:this.forkEligible,forkTests:this.forkTests,forkProofs:this.forkProofs,cachedProofSkips:this.cachedProofSkips});
  }
}
