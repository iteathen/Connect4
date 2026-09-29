// Independent rule-only diagnostic. NOT an IsoMax search replacement or benchmark.
// No solver, solved-result, opening-book or answer-table imports.
import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

export function geometry(columns,rows){
  const lines=[];
  for(let r=0;r<rows;r++)for(let c=0;c<columns;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+3*dc,y=r+3*dr;
    if(x<columns&&y>=0&&y<rows)lines.push(Array.from({length:4},(_,i)=>(r+i*dr)*columns+c+i*dc));
  }
  return {columns,rows,lines,cells:columns*rows};
}
function terminal(g,s){
  for(const l of g.lines){const p=s.board[l[0]];if(p>=0&&l.every(x=>s.board[x]===p))return p?-1:1;}
  return s.rank===g.cells?0:null;
}
function child(g,s,c){
  assert.ok(Number.isInteger(c)&&c>=0&&c<g.columns&&s.heights[c]<g.rows);
  const board=s.board.slice(),heights=s.heights.slice();
  board[heights[c]++*g.columns+c]=s.rank&1;
  return {board,heights,rank:s.rank+1,moves:[...s.moves,c]};
}
export function replay(g,moves){
  let s={board:new Int8Array(g.cells).fill(-1),heights:new Uint8Array(g.columns),rank:0,moves:[]};
  for(const c of moves){assert.equal(terminal(g,s),null,'move after terminal');s=child(g,s,c);}
  return s;
}
function winsAt(g,s,c,p){
  const cell=s.heights[c]*g.columns+c;s.board[cell]=p;
  const win=g.lines.some(l=>l.includes(cell)&&l.every(x=>s.board[x]===p));
  s.board[cell]=-1;return win;
}
function residuals(g,s,p){
  return g.lines.filter(l=>!l.some(x=>s.board[x]===(p^1))).map(l=>l.filter(x=>s.board[x]!==p));
}
export function pairing(g,s){
  // Opponent responds in the same column, taking each upper cell of a pair.
  // Every remaining column capacity must be even at the attacker's turn.
  const odd=[];for(let c=0;c<g.columns;c++)if((g.rows-s.heights[c])&1)odd.push(c);
  if(odd.length)return {covered:false,reason:'ODD_REMAINING_CAPACITY',odd};
  const rs=residuals(g,s,s.rank&1),uncovered=[];
  for(const r of rs)if(!r.some(x=>(((Math.floor(x/g.columns)-s.heights[x%g.columns])&1)===1)))uncovered.push(r);
  return {covered:uncovered.length===0,residualCount:rs.length,uncoveredCount:uncovered.length,firstUncovered:uncovered[0]??null};
}
export function leaf(g,s){
  const t=terminal(g,s);if(t!==null)return {lo:t,hi:t,rule:'TERMINAL'};
  const mover=s.rank&1,value=mover?-1:1;
  for(let c=0;c<g.columns;c++)if(s.heights[c]<g.rows&&winsAt(g,s,c,mover))return {lo:value,hi:value,rule:'IMMEDIATE_WIN'};
  let threats=0;
  for(let c=0;c<g.columns;c++)if(s.heights[c]<g.rows&&winsAt(g,s,c,mover^1))threats++;
  if(threats>=2)return {lo:-value,hi:-value,rule:'DOUBLE_THREAT'};
  let lo=-1,hi=1;
  if(residuals(g,s,0).length===0)hi=0;
  if(residuals(g,s,1).length===0)lo=0;
  if(pairing(g,s).covered){if(mover)lo=0;else hi=0;}
  return {lo,hi,rule:lo===hi?'EXHAUSTED':lo!==-1||hi!==1?'NO_WIN_BOUND':'UNKNOWN'};
}
export function analyze(g,moves,depth){
  assert.ok(Number.isInteger(depth)&&depth>=1&&depth<=8);
  const root=replay(g,moves),memo=new Map(),stats={calls:0,expanded:0,hits:0,horizon:0,rules:{},byPly:[]};
  function visit(s,left){
    stats.calls++;stats.byPly[s.rank]=(stats.byPly[s.rank]??0)+1;
    const key=left+':'+Array.from(s.board).join(',');
    if(memo.has(key)){stats.hits++;return memo.get(key);}
    const b=leaf(g,s);stats.rules[b.rule]=(stats.rules[b.rule]??0)+1;
    if(b.lo===b.hi||left===0){if(left===0&&b.lo!==b.hi)stats.horizon++;memo.set(key,b);return b;}
    stats.expanded++;
    let lo=s.rank&1?1:-1,hi=lo;
    for(let c=0;c<g.columns;c++)if(s.heights[c]<g.rows){
      const v=visit(child(g,s,c),left-1);
      if(s.rank&1){lo=Math.min(lo,v.lo);hi=Math.min(hi,v.hi);}else{lo=Math.max(lo,v.lo);hi=Math.max(hi,v.hi);}
    }
    const out={lo:Math.max(lo,b.lo),hi:Math.min(hi,b.hi)};assert.ok(out.lo<=out.hi);
    memo.set(key,out);return out;
  }
  assert.equal(terminal(g,root),null);
  const actions=[];
  for(let c=0;c<g.columns;c++)if(root.heights[c]<g.rows)actions.push({column:c,...visit(child(g,root,c),depth-1)});
  const minimizing=!!(root.rank&1),combine=minimizing?Math.min:Math.max;
  const lo=combine(...actions.map(a=>a.lo)),hi=combine(...actions.map(a=>a.hi));
  const certifiedOptimal=actions.filter(a=>actions.every(b=>a===b||(minimizing?a.hi<=b.lo:a.lo>=b.hi))).map(a=>a.column);
  return {prefix:moves.map(c=>c+1).join(''),depth,orientation:'absolute P0; actions zero-based',lo,hi,actions,certifiedOptimal,
    pairing:pairing(g,root),rootLeaf:leaf(g,root),stats:{...stats,unique: memo.size}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const g=geometry(7,6);assert.equal(g.lines.length,69);
  const rows=[];
  for(const prefix of ['44','444','4444'])for(const depth of [2,4,6]){
    const start=performance.now(),r=analyze(g,Array.from(prefix,c=>Number(c)-1),depth);
    rows.push({...r,diagnosticWallMs:performance.now()-start});
    console.error(JSON.stringify({prefix,depth,lo:r.lo,hi:r.hi,calls:r.stats.calls,unique:r.stats.unique}));
  }
  const result={schema:'center-prefix.rule-only-partial-proof.v1',createdAt:new Date().toISOString(),runtime:process.version,
    sourceSha256:createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),
    inputs:['7x6 connect-four','gravity','alternating turns','first-win stopping','44','444','4444'],
    solvedInputsUsed:false,scope:'diagnostic bounds, not polynomial construction or production benchmark',rows};
  assert.ok(process.argv[2],'output path required');writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');
}
