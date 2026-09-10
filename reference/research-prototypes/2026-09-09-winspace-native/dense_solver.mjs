// Root facts participate in exact key identity. Goal IDs common to both players
// sort first; private-goal owner is already known from the immutable program.
import{LineSolver}from'./line_solver.mjs';import{geometry,minimal}from'./support.mjs';
const G=geometry(),ORDER=G.order;
const pop=x=>{x-=x>>>1&0x55555555;x=(x&0x33333333)+(x>>>2&0x33333333);return Math.imul((x+(x>>>4))&0x0f0f0f0f,0x01010101)>>>24;};
const multi=(lo,hi)=>hi!==0?(lo!==0||(hi&(hi-1))!==0):(lo!==0&&(lo&(lo-1))!==0);
function unroll(s,n){const marker='for(let g=0;g<'+n+';g++){';while(s.includes(marker)){const a=s.indexOf(marker),start=a+marker.length;let end=start,l=1;for(;l;end++){if(s[end]==='{')l++;if(s[end]==='}')l--;}const body=s.slice(start,end-1);let out='';for(let i=0;i<n;i++)out+='{'+body.replace(/\bg\b/g,String(i))+'}';s=s.slice(0,a)+out+s.slice(end);}return s;}
const factory=src=>new Function('G','ORDER','pop','multi','minimal','return function '+src)(G,ORDER,pop,multi,minimal);
let compiler=LineSolver.prototype.compile.toString();
compiler=compiler.replace('this.goalCount=dictionary.length;',`
    const old=this.rootLive.slice(),order=Array.from({length:dictionary.length},(_,i)=>i);
    const shared=i=>((old[i>>>5]&old[(i>>>5)+3])>>>(i&31))&1;
    order.sort((a,b)=>shared(b)-shared(a)||a-b);
    this.bothCount=order.reduce((sum,i)=>sum+shared(i),0);const sorted=order.map(i=>dictionary[i]);
    this.rootLive.fill(0);for(let j=0;j<order.length;j++)for(let p=0;p<2;p++)if((old[p*3+(order[j]>>>5)]>>>(order[j]&31))&1)this.rootLive[p*3+(j>>>5)]|=1<<(j&31);
    dictionary.splice(0,dictionary.length,...sorted);
    this.extra=Math.ceil(Math.max(0,this.bothCount-11)/32);
    this.sm0=(2**Math.min(11,this.bothCount)-1)>>>0;
    this.sm1=(2**Math.min(32,Math.max(0,this.bothCount-11))-1)>>>0;
    this.sm2=(2**Math.min(32,Math.max(0,this.bothCount-43))-1)>>>0;
    this.goalCount=dictionary.length;`);
compiler=compiler.replace('const keyWords=1+2*this.groups;','const keyWords=1+this.groups+this.extra;');
// Incidence compilation visits only actual future requirement cells, at most four per goal.
const oldLoop=`for(let c=0;c<7;c++)for(let r=s.heights[c];r<6;r++){
        const cell=c*7+r,m=1<<(cell&31);if(cell<32?(a&m)!==0:(b&m)!==0)this.inc[cell*3+word]|=bit;
      }`;
if(!compiler.includes(oldLoop))throw Error('compiler source seam');
compiler=compiler.replace(oldLoop,`let al=(a&this.eLo)>>>0,ah=(b&this.eHi)>>>0;
      while(al){const cell=31-Math.clz32(al&-al);this.inc[cell*3+word]|=bit;al=(al&(al-1))>>>0;}
      while(ah){const cell=63-Math.clz32(ah&-ah);this.inc[cell*3+word]|=bit;ah=(ah&(ah-1))>>>0;}`);
const COMPILE=factory(compiler),METHODS=new Map();
function methods(groups,extra){const id=groups*3+extra;if(METHODS.has(id))return METHODS.get(id);
 const names=['((height|((c0&this.sm0)<<21))>>>0)','((c0|o0)>>>0)'];
 if(groups>1)names.push('((c1|o1)>>>0)');if(groups>2)names.push('((c2|o2)>>>0)');
 if(extra>0)names.push('(((c0>>>11)|(c1<<21))&this.sm1)>>>0');
 if(extra>1)names.push('(((c1>>>11)|(c2<<21))&this.sm2)>>>0');
 const decl='const '+names.map((x,i)=>`k${i}=${x}`).join(',')+';';
 let hash='let h=k0;';for(let i=1;i<names.length;i++)hash+=`h=Math.imul(h^k${i},${i%2?'0x9e3779b1':'0x85ebca6b'});`;
 const eq=names.map((_,i)=>`ks[${i}][slot]===k${i}`).join('&&');
 const probe=decl+hash+`const slot=((h^(h>>>16))>>>0)%this.size,ks=this.keys;
    if(ks[0][slot]===k0){const v1=Atomics.load(this.ctrl,slot);
      if(!(v1&1)&&${eq}){const value=this.val[slot],v2=Atomics.load(this.ctrl,slot);
        if(v1===v2&&value){this.ttHits++;if(value>37){low=value-56;if(alpha<low){alpha=low;if(alpha>=beta)return alpha;}}
          else{high=value-19;if(beta>high){beta=high;if(alpha>=beta)return beta;}}}
      }
    }
    `;
 let search=LineSolver.prototype.search.toString(),begin=search.indexOf('let h=height;'),end=search.indexOf('this.wins(c0,c1,c2,eLo,eHi,moves);',begin);
 if(begin<0||end<0)throw Error('search source seam');search=search.slice(0,begin)+probe+search.slice(end);
 search=unroll(search.replaceAll('this.groups',String(groups)),groups);
 const pub=`publish(slot,height,c0,c1,c2,o0,o1,o2,value){
 this.writeAttempts++;const v=Atomics.load(this.ctrl,slot);
 if((v&1)||Atomics.compareExchange(this.ctrl,slot,v,(v+1)|0)!==v){this.writeBusy++;return;}
 ${decl}const ks=this.keys;${names.map((_,i)=>`ks[${i}][slot]=k${i};`).join('')}
 this.val[slot]=value;this.owner[slot]=1;Atomics.store(this.ctrl,slot,(v+2)|0);this.writeSuccess++;}`;
 const result={search:factory(search),publish:factory(pub),wins:factory(unroll(LineSolver.prototype.wins.toString().replaceAll('this.groups',String(groups)),groups))};METHODS.set(id,result);return result;
}
export class DenseLineSolver extends LineSolver{
 constructor(budget=14*131072){super('compiled',budget);}
 compile(s){const meta=COMPILE.call(this,s),m=methods(this.groups,this.extra);this.search=m.search;this.wins=m.wins;this.publish=m.publish;return{...meta,both:this.bothCount,extra:this.extra};}
}
