// Prespecified enriched extension: legal restricted-wing trajectories, selected
// on structure only. No solver or outcome-dependent selection.
import {parse,bits,won,rng} from './domain.mjs';
import {compile,makeGeometry} from './requirements.mjs';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const g=makeGeometry(),random=rng(0x0f162026),cases=[],seen=new Set();let tries=0;
function immediate(s){for(let c=0;c<7;c++){const r=s.heights[c];if(r===6)continue;for(let p=1;p<=2;p++){s.board[r*7+c]=p;const win=won(s.board,7,6,4,c,r,p);s.board[r*7+c]=0;if(win)return true;}}return false;}
while(cases.length<16&&tries<100000){
  const target=[18,20,22,24][tries%4],left=(tries&4)===0;tries++;const s=parse('');let seq='';
  while(s.moves<target){const legal=[];for(let c=left?0:3;c<(left?4:7);c++){const r=s.heights[c];if(r===6)continue;const p=(s.moves&1)+1;s.board[r*7+c]=p;const win=won(s.board,7,6,4,c,r,p);s.board[r*7+c]=0;if(!win)legal.push(c);}if(!legal.length)break;const c=legal[random()%legal.length],r=s.heights[c]++;s.board[r*7+c]=(s.moves&1)+1;s.moves++;seq+=String(c+1);}
  if(s.moves!==target||seen.has(seq))continue;const cp=compile(s,g);
  if(cp.neutralColumns<2||cp.draw||immediate(s))continue;
  seen.add(seq);cases.push({id:1000+cases.length,seq,cohort:'openWing',ply:s.moves,...bits(s),structure:{rawCounts:cp.rawCounts,minCounts:cp.minCounts,erasedCells:cp.erasedCells,neutralColumns:cp.neutralColumns,neutralCells:cp.neutralCells,draw:cp.draw},rootImmediateEither:false});
}
const old=JSON.parse(readFileSync(new URL('./corpus.json',import.meta.url),'utf8')),text=JSON.stringify({...old,extension:{seed:'0f162026',tries,accepted:cases.length,selection:'first legal roots with two certified neutral columns, no immediate win, one restricted prefilled wing; no solver invoked'},cases:[...old.cases,...cases]},null,2)+'\n';
writeFileSync(new URL('./corpus-wing.json',import.meta.url),text);
console.log(JSON.stringify({kind:'frozenWingExtension',sha256:createHash('sha256').update(text).digest('hex'),tries,cases:cases.length,positions:cases.map(c=>({seq:c.seq,ply:c.ply,...c.structure}))}));
