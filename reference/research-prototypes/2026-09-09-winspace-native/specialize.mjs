// Cold specialization only. Generated functions have no goal-word loops or shape branches.
import {LineSolver} from './line_solver.mjs';
import{geometry}from'./support.mjs';
const G=geometry(),ORDER=G.order;
const pop=x=>{x-=x>>>1&0x55555555;x=(x&0x33333333)+(x>>>2&0x33333333);return Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24;};
const multi=(lo,hi)=>hi!==0?(lo!==0||(hi&(hi-1))!==0):(lo!==0&&(lo&(lo-1))!==0);
function unroll(s,n){
  const marker='for(let g=0;g<'+n+';g++){';
  while(s.includes(marker)){
    const a=s.indexOf(marker),start=a+marker.length;let end=start,level=1;
    for(;level;end++){if(s[end]==='{')level++;if(s[end]==='}')level--;}
    const body=s.slice(start,end-1);let out='';for(let i=0;i<n;i++)out+='{'+body.replace(/\bg\b/g,String(i))+'}';
    s=s.slice(0,a)+out+s.slice(end);
  }return s;
}
const METHODS=Array.from({length:4},(_,n)=>n?Object.fromEntries(['wins','search','publish'].map(name=>{
  let src='function '+LineSolver.prototype[name].toString();src=unroll(src.replaceAll('this.groups',String(n)),n);
  return [name,new Function('G','ORDER','pop','multi','return '+src)(G,ORDER,pop,multi)];
})):null);
export class FastLineSolver extends LineSolver{
  compile(s){const meta=super.compile(s),m=METHODS[this.groups];this.wins=m.wins;this.search=m.search;this.publish=m.publish;return meta;}
}
