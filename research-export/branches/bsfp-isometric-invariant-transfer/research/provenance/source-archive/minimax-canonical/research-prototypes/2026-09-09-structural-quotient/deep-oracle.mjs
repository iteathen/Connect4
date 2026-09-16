// Deliberately independent cell-array alpha-beta. No requirement compiler,
// bitboard move generator, two-word TT, pruning or publication is used here.
// Strings/Map are oracle-only; not a proposed performance implementation.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {parse,won} from './domain.mjs';
const corpus=JSON.parse(readFileSync(new URL('./corpus-wing.json',import.meta.url),'utf8'));
const raw=readFileSync(new URL('../../../docs/research/evidence/2026-09-09-structural-quotient/trials-wing-512k.jsonl',import.meta.url),'utf8').trim().split('\n').map(JSON.parse);
const expected=new Map(raw.filter(r=>r.kind==='trial'&&r.mode==='base'&&r.rep===0).map(r=>[r.id,r.score]));
const ORDER=[3,2,4,1,5,0,6],limit=2000000;
for(const c of corpus.cases.filter(c=>c.cohort==='openWing')) {
  const s=parse(c.seq),tt=new Map();let nodes=0;const t=performance.now();
  function rec(m,alpha,beta) {
    if(++nodes>limit)throw Error('oracle-limit');
    if(m===42)return 0;
    const key=s.board.join(''),a0=alpha,b0=beta,entry=tt.get(key);
    if(entry){if(entry.flag===0)return entry.value;if(entry.flag===1)alpha=Math.max(alpha,entry.value);else beta=Math.min(beta,entry.value);if(alpha>=beta)return entry.value;}
    const p=(m&1)+1;
    for(const col of ORDER){const row=s.heights[col];if(row===6)continue;s.board[row*7+col]=p;const win=won(s.board,7,6,4,col,row,p);s.board[row*7+col]=0;if(win){const value=Math.floor((43-m)/2);tt.set(key,{value,flag:0});return value;}}
    let best=-22;
    for(const col of ORDER){const row=s.heights[col];if(row===6)continue;s.heights[col]++;s.board[row*7+col]=p;
      const value=-rec(m+1,-beta,-alpha);s.board[row*7+col]=0;s.heights[col]--;
      if(value>best)best=value;if(value>alpha)alpha=value;if(alpha>=beta)break;
    }
    tt.set(key,{value:best,flag:best<=a0?2:best>=b0?1:0});return best;
  }
  try{const score=rec(s.moves,-22,22)||0;assert.equal(score,expected.get(c.id),c.seq);console.log(JSON.stringify({id:c.id,seq:c.seq,score,expected:expected.get(c.id),nodes,entries:tt.size,ms:performance.now()-t,passed:true}));}
  catch(e){if(e.message!=='oracle-limit')throw e;console.log(JSON.stringify({id:c.id,seq:c.seq,nodes,ms:performance.now()-t,limited:true,passed:false}));}
}
