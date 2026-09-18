import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parse,bits,rng,trajectory,won} from './domain.mjs';
import {compile,makeGeometry} from './requirements.mjs';
const g=makeGeometry(),cases=[],counts={},rejections={};
function immediate(s){for(let c=0;c<7;c++){const r=s.heights[c];if(r===6)continue;for(let p=1;p<=2;p++){s.board[r*7+c]=p;const v=won(s.board,7,6,4,c,r,p);s.board[r*7+c]=0;if(v)return true;}}return false;}
function add(seq,cohort){const s=parse(seq),cp=compile(s,g);cases.push({id:cases.length,seq,cohort,ply:s.moves,...bits(s),structure:{rawCounts:cp.rawCounts,minCounts:cp.minCounts,erasedCells:cp.erasedCells,neutralColumns:cp.neutralColumns,neutralCells:cp.neutralCells,draw:cp.draw},rootImmediateEither:immediate(s)});counts[cohort]=(counts[cohort]||0)+1;}
add('663152175','legacy');add('41267575','legacy');add('121212','tactical');
let random=rng(0xc4102031),attempts=0;
while((counts.natural||0)<64&&attempts<100000){const ply=[22,26,30,34][(counts.natural||0)%4];attempts++;const t=trajectory(random,ply);if(t)add(t.seq,'natural');}
rejections.naturalAttempts=attempts;
random=rng(0x51ab2026);attempts=0;const unique=new Set(cases.map(c=>c.seq));
while((counts.opportunity||0)<48&&attempts<150000){const ply=[22,24,26,28,30,32][attempts%6];attempts++;const t=trajectory(random,ply,{avoidWins:true});if(!t||unique.has(t.seq))continue;const cp=compile(t.state,g);if(cp.neutralColumns<2||cp.draw||immediate(t.state))continue;unique.add(t.seq);add(t.seq,'opportunity');}
rejections.opportunityAttempts=attempts;
random=rng(0xde6e2026);attempts=0;
while((counts.dense||0)<16&&attempts<30000){attempts++;const t=trajectory(random,24,{avoidWins:true});if(!t||immediate(t.state))continue;const cp=compile(t.state,g);if(cp.erasedCells!==0)continue;add(t.seq,'dense');}
rejections.denseAttempts=attempts;
random=rng(0xd0a02026);attempts=0;
while((counts.deadDraw||0)<8&&attempts<50000){attempts++;const t=trajectory(random,34,{avoidWins:true});if(t&&compile(t.state,g).draw)add(t.seq,'deadDraw');}
rejections.deadDrawAttempts=attempts;
const text=JSON.stringify({version:1,seeds:{natural:'c4102031',opportunity:'51ab2026',dense:'de6e2026',deadDraw:'d0a02026'},counts,rejections,cases},null,2)+'\n';
writeFileSync(new URL('./corpus.json',import.meta.url),text);
console.log(JSON.stringify({kind:'frozenCorpus',sha256:createHash('sha256').update(text).digest('hex'),counts,rejections,selection:'root structural facts only; no measured score/nodes/time'}));
