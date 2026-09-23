import {basis7x6} from './coordinate.mjs';
import {firstSetBitIndex32} from '../../../vendor/jsminsys/src/word32.mjs';

// COLD worker-private arena. Slots hold FrontGenerators (paired favorable q),
// not residual requirements. No pointer/reference to this arena enters the TT.
export function prepareFrontArena7x6(depth=2,capacity=256,budget=100000){
  if(!Number.isInteger(depth)||depth<0||depth>4||!Number.isInteger(capacity)||capacity<1||capacity>8192||
    !Number.isInteger(budget)||budget<1||budget>10000000)throw new RangeError('front arena bounds');
  const slots=(depth+1)*12+29;
  return {depth,capacity,budget,steps:0,error:0,actionBase:(depth+1)*12,local:slots-1,
    words:new Uint32Array(slots*capacity*6),count:new Uint32Array(slots),
    basis:new Uint32Array((depth+1)*69),size:new Uint32Array(depth+1),valid:new Uint32Array((depth+1)*3),
    up:new Uint32Array((depth+1)*69*3),seen:new Uint32Array(20),temp:new Uint32Array(6),
    image0:new Uint32Array(69*3),image1:new Uint32Array(69*3),top1:new Uint32Array(69),
    adjoint:new Uint32Array(3),target:new Uint32Array(70*3),cover:new Uint32Array(70*3),next:new Uint32Array(70)};
}

// E0/E1 JSMinSys CONTRACT — PRESERVE THROUGH CALLEES. Fixed uint32 words and
// numeric outcomes only. No strings, arrays/objects, allocation, callbacks or
// hidden growth. Correlated paired generators are never factored into marginals.
// 6 = bounded construction incomplete; 7 = arena exhausted. Never WDL.
function spend(a){if(++a.steps>a.budget){a.error=6;return 0;}return 1;}
export function insertFront7x6(a,slot){
  if(!spend(a))return a.error;
  const base=slot*a.capacity*6;
  // Compare the candidate before mutation: a dominated insert costs no capacity.
  for(let i=0;i<a.count[slot];i++){
    if(!spend(a))return a.error;
    let yes=1;for(let k=0;k<6;k++)if(a.words[base+i*6+k]&~a.temp[k]){yes=0;break;}
    if(yes)return 0;
  }
  let i=0;
  while(i<a.count[slot]){
    if(!spend(a))return a.error;
    let yes=1;for(let k=0;k<6;k++)if(a.temp[k]&~a.words[base+i*6+k]){yes=0;break;}
    if(yes){const last=--a.count[slot];for(let k=0;k<6;k++)a.words[base+i*6+k]=a.words[base+last*6+k];}
    else i++;
  }
  if(a.count[slot]===a.capacity){a.error=7;return 7;}
  const dst=base+a.count[slot]++*6;for(let k=0;k<6;k++)a.words[dst+k]=a.temp[k];
  return 0;
}
function copyFront(a,from,to){
  a.count[to]=a.count[from];
  const src=from*a.capacity*6,dst=to*a.capacity*6;
  for(let i=0;i<a.count[from]*6;i++)a.words[dst+i]=a.words[src+i];
}
function universal(a,slot){a.count[slot]=1;for(let k=0;k<6;k++)a.words[slot*a.capacity*6+k]=0;}
export function combineFront7x6(a,left,right,out,intersect){
  a.count[out]=0;
  if(!intersect){
    copyFront(a,left,out);
    for(let j=0;j<a.count[right];j++){
      for(let k=0;k<6;k++)a.temp[k]=a.words[(right*a.capacity+j)*6+k];
      if(insertFront7x6(a,out))return a.error;
    }
  }else{
    // Stream one outer generator's skyline before global absorption. No product
    // array or mixed-reply-cover flattening. The join is bitwise OR in favorable
    // paired coordinates, retaining the correlation carrier.
    for(let i=0;i<a.count[left];i++){
      a.count[a.local]=0;
      for(let j=0;j<a.count[right];j++){
        for(let k=0;k<6;k++)a.temp[k]=a.words[(left*a.capacity+i)*6+k]|a.words[(right*a.capacity+j)*6+k];
        if(insertFront7x6(a,a.local))return a.error;
      }
      for(let j=0;j<a.count[a.local];j++){
        for(let k=0;k<6;k++)a.temp[k]=a.words[(a.local*a.capacity+j)*6+k];
        if(insertFront7x6(a,out))return a.error;
      }
    }
  }
  return 0;
}
function prepareImages(g,a,d,cell,mover){
  const n=a.size[d],cn=a.size[d+1];
  for(let i=0;i<n;i++){
    const id=a.basis[d*69+i];
    for(let k=0;k<3;k++){a.image0[i*3+k]=0;a.image1[i*3+k]=0;}
    a.top1[i]=0;
    for(let p=0;p<2;p++){
      if(p!==mover && g.contains[id*42+cell])continue;
      const image=p===mover?g.remove[id*42+cell]:id;
      const out=p===0?a.image0:a.image1;
      if(image<0){
        if(p===1)a.top1[i]=1;
        for(let k=0;k<3;k++)out[i*3+k]=a.valid[(d+1)*3+k];
      }else for(let j=0;j<cn;j++)if(g.subset[a.basis[(d+1)*69+j]*625+image])out[i*3+(j>>>5)]|=1<<(j&31);
    }
  }
}
function covers(a,d,childBase,out){
  const n=a.size[d];
  for(let k=0;k<3;k++){a.target[k]=a.words[childBase+k];a.cover[k]=0;}
  a.next[0]=0;let level=0;
  // Exact uncovered-target recurrence. Each descent covers a previously missing
  // target bit; depth <=69. Duplicate covers are absorbed, never approximated.
  while(level>=0){
    if(!spend(a))return a.error;
    const b=level*3;
    if(!(a.target[b]|a.target[b+1]|a.target[b+2])){
      for(let k=0;k<3;k++){a.temp[k]=a.cover[b+k];a.temp[3+k]=a.valid[d*3+k]&~a.adjoint[k];}
      if(insertFront7x6(a,out))return a.error;
      level--;continue;
    }
    let lane=0;while(!a.target[b+lane])lane++;
    const mask=1<<firstSetBitIndex32(a.target[b+lane]);
    let i=a.next[level];while(i<n && !(a.image0[i*3+lane]&mask))i++;
    if(i===n){level--;continue;}
    a.next[level]=i+1;
    for(let k=0;k<3;k++){
      a.target[b+3+k]=a.target[b+k]&~a.image0[i*3+k];
      a.cover[b+3+k]=a.cover[b+k]|a.up[(d*69+i)*3+k];
    }
    level++;a.next[level]=0;
  }
  return 0;
}
function preimage(a,d,child,out,cell,mover){
  a.count[out]=0;
  for(let j=0;j<a.count[child];j++){
    const cb=(child*a.capacity+j)*6;
    for(let k=0;k<3;k++)a.adjoint[k]=0;
    for(let i=0;i<a.size[d];i++){
      if(a.top1[i])continue; // Fresh WIN_NOW is above the full ordinary upset.
      let ok=1;
      for(let k=0;k<3;k++)if(a.image1[i*3+k]&a.words[cb+3+k]){ok=0;break;}
      if(ok)for(let k=0;k<3;k++)a.adjoint[k]|=a.up[(d*69+i)*3+k];
    }
    if(covers(a,d,cb,out))return a.error;
  }
  if(mover===0){
    for(let i=0;i<a.size[d];i++)if(a.basis[d*69+i]===cell){
      for(let k=0;k<3;k++){a.temp[k]=a.up[(d*69+i)*3+k];a.temp[3+k]=0;}
      if(insertFront7x6(a,out))return a.error;
      break;
    }
  }
  return 0;
}
export function buildFour7x6(g,a,support,d,remaining){
  if(d===0){a.steps=0;a.error=0;for(let s=0;s<28;s++)a.count[a.actionBase+s]=0;}
  if(!spend(a))return a.error;
  const slot=d*12,n=basis7x6(g,support,a.basis,d*69,a.seen);
  a.size[d]=n;
  for(let k=0;k<3;k++)a.valid[d*3+k]=n>=32*(k+1)?0xffffffff:n>32*k?(0xffffffff>>>(32-(n-32*k))):0;
  for(let i=0;i<n;i++){
    for(let k=0;k<3;k++)a.up[(d*69+i)*3+k]=0;
    for(let j=0;j<n;j++)if(g.subset[a.basis[d*69+j]*625+a.basis[d*69+i]])a.up[(d*69+i)*3+(j>>>5)]|=1<<(j&31);
  }
  if((support>>>21)===42){
    universal(a,slot);a.count[slot+1]=0;universal(a,slot+2);a.count[slot+3]=0;return 0;
  }
  if(!remaining){a.count[slot]=0;a.count[slot+1]=0;universal(a,slot+2);universal(a,slot+3);return 0;}
  const mover=(support>>>21)&1;
  for(let h=0;h<4;h++){if(mover)universal(a,slot+h);else a.count[slot+h]=0;}
  for(let c=0;c<7;c++){
    const height=(support>>>(c*3))&7;if(height===6)continue;
    if(buildFour7x6(g,a,support+(1<<(c*3))+(1<<21),d+1,remaining-1))return a.error;
    const cell=height*7+c;prepareImages(g,a,d,cell,mover);
    for(let h=0;h<4;h++){
      if(preimage(a,d,(d+1)*12+h,slot+4+h,cell,mover))return a.error;
      if(d===0)copyFront(a,slot+4+h,a.actionBase+c*4+h);
      if(combineFront7x6(a,slot+h,slot+4+h,slot+8+h,mover))return a.error;
      copyFront(a,slot+8+h,slot+h);
    }
  }
  return 0;
}
function member(a,slot,words,offset){
  for(let i=0;i<a.count[slot];i++){
    const b=(slot*a.capacity+i)*6;let ok=1;
    for(let k=0;k<3;k++)if((a.words[b+k]&~words[offset+2+k])||(a.words[b+3+k]&words[offset+5+k])){ok=0;break;}
    if(ok)return 1;
  }
  return 0;
}
// Packed endpoint codes, each 1..3. These are bounds, not an exact WDL code.
export function queryFour7x6(a,slot,words,offset){
  const lower=member(a,slot+1,words,offset)?3:member(a,slot,words,offset)?2:1;
  const upper=member(a,slot+3,words,offset)?3:member(a,slot+2,words,offset)?2:1;
  return lower|(upper<<2);
}
