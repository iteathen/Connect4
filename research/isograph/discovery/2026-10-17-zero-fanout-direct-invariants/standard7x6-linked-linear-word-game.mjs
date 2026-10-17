// One bounded column-symbol word + ONE linked 1D geometry tape.
// Not a strategic game tree evaluator: one literal append source transition.
// W/H/K symbolic; owner research presently ONLY actual standard 7x6/c4.
// Frozen theorem docs/research/2026-10-17-exact-linear-word-unfolding-of-7x6-gravity-game.md
import {createFourRibbonSourceLift} from './standard7x6-four-ribbon-source-lift.mjs';
export function createLinkedLinearWordGame({width:W,height:H,connect:K}){
 const ribbon=createFourRibbonSourceLift({width:W,height:H,connect:K});
 const tape=[],segments=[],wires=Array.from({length:W*H},()=>[]);
 for(let j=0;j<ribbon.strands.length;j++){
  const strand=ribbon.strands[j],start=tape.length;
  for(let k=0;k<strand.physicalCellIDs.length;k++){
   const physicalId=strand.physicalCellIDs[k],offset=tape.length;
   wires[physicalId].push(offset);
   tape.push(physicalId);
  }
  segments.push({id:j,direction:strand.direction,coordinate:strand.coordinate,
   start,length:strand.physicalCellIDs.length,end:tape.length});
  if(j!==ribbon.strands.length-1)tape.push(-1); // explicit 1D strand delimiter
 }
 const intervals=ribbon.windows.map(win=>({
  id:win.id,start:segments[win.strand].start+win.offset,length:K,
  originalPhysicalMask:win.mask,direction:win.direction,
  sourceStrand:win.strand
 }));
 for(const it of intervals)for(let j=0;j<K;j++){
  if(tape[it.start+j]<0)throw Error('a geometric win interval crossed tape strand delimiter');
  const physicalId=ribbon.windows[it.id].physicalCellIDs[j];
  if(tape[it.start+j]!==physicalId)throw Error('win interval changed original geometry');
 }
 if(wires.some(refs=>refs.length!==4))throw Error('four tape alias occurrences required');
 const immutable={tape:tape.slice(),segments,intervals,wires};
 function fromSource(q){
  const lifted=ribbon.encode(q),n0=lifted.n;
  return {h0:lifted.h.slice(),initialPly:n0,counts:Array(W).fill(0),
    letters:[],lifted,placedFutureEvents:[],terminal:null};
 }
 function legal(state){
  if(state.terminal)throw Error('cannot continue after first win / full draw');
  return state.counts.flatMap((n,c)=>state.h0[c]+n<H?[c]:[]);
 }
 function append(state,c){
  if(state.terminal)throw Error('illegal continuation after first win');
  if(!Number.isInteger(c)||c<0||c>=W||state.counts[c]+state.h0[c]>=H)
   throw Error('invalid literal next word symbol or exhausted column');
  const absoluteTurn=state.initialPly+state.letters.length+1;
  const owner=(absoluteTurn-1)&1;
  const occ=state.counts[c]+1;
  const row=state.h0[c]+occ-1,cellId=row*W+c;
  const fourAliasTapeOffsets=wires[cellId].slice();
  const cofactor=ribbon.next(state.lifted,c);
  const nextLetters=state.letters.concat(c);
  const event={literalColumn:c+1,columnOrdinal:occ,absoluteRow:row+1,
    absoluteTurn,owner,physicalCellId:cellId,fourAliasTapeOffsets};
  if('terminal' in cofactor)
   return {terminal:cofactor.terminal,kind:cofactor.kind,
    trigger:event,letters:nextLetters};
  const counts=state.counts.slice();counts[c]++;
  return {state:{
   h0:state.h0.slice(),initialPly:state.initialPly,
   counts,letters:nextLetters,lifted:cofactor.lifted,
   placedFutureEvents:state.placedFutureEvents.concat(event),terminal:null},
   trigger:event};
 }
 function sourceQ(state){
  if(state.terminal)throw Error('terminal game does not have nonterminal q');
  return ribbon.decode(state.lifted);
 }
 // FIXED COMPLETE hypothetical word payoff, NOT a game-value procedure.
 // The full schedule may hypothetically extend beyond the first terminal,
 // which is allowed for one-shot falsification only.
 function payoffOfFullHypotheticalWord(q,word){
  const base=ribbon.encode(q),n=base.n,T=W*H-n;
  if(!Array.isArray(word)||word.length!==T)throw Error('expected complete remaining-event multiset word');
  const counts=Array(W).fill(0),futureOwner=Array(W*H).fill(-1),
   position=Array(W*H).fill(-1);
  for(let i=0;i<word.length;i++){
   const c=word[i];if(!Number.isInteger(c)||c<0||c>=W)throw Error('bad symbol');
   const row=q.h[c]+counts[c]++;
   if(row>=H)throw Error('invalid bounded word / gravity');
   const id=row*W+c;
   futureOwner[id]=(n+i)&1;
   position[id]=i+1;
  }
  if(counts.some((z,c)=>z!==H-q.h[c]))throw Error('not a complete hypothetical gravity schedule');
  let first=Infinity,winner=null;
  for(let p=0;p<2;p++)for(const G of base.generators[p]){
   let complete=true,latest=0;
   for(let id=0;id<W*H;id++){
    if((G.mask&(1n<<BigInt(id)))===0n)continue;
    if(futureOwner[id]!==p){complete=false;break;}
    latest=Math.max(latest,position[id]);
   }
   if(complete&&latest<first){first=latest;winner=p;}
  }
  if(winner!==null&&(n+first-1)%2!==winner)throw Error('fixed-word first-win parity invalid');
  return {winner,relativeTurn:Number.isFinite(first)?first:null,
    absoluteTurn:Number.isFinite(first)?n+first:null};
 }
 return Object.freeze({W,H,K,immutable,ribbon,fromSource,legal,append,sourceQ,
  payoffOfFullHypotheticalWord});
}
